"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WAREHOUSE_RESOURCES = void 0;
exports.getWarehouseData = getWarehouseData;
exports.saveWarehouseData = saveWarehouseData;
exports.addStock = addStock;
exports.removeStock = removeStock;
exports.getStock = getStock;
exports.recordTransaction = recordTransaction;
exports.resetHourlyStats = resetHourlyStats;
exports.getPrice = getPrice;
exports.getTotalValue = getTotalValue;
exports.addTreasury = addTreasury;
exports.removeTreasury = removeTreasury;
exports.getTreasury = getTreasury;
exports.getWarehouseStats = getWarehouseStats;
exports.startWarehouseStatsReset = startWarehouseStatsReset;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cacheManager_1 = require("./cacheManager");
const dataDir = path_1.default.join(process.cwd(), "src", "data");
const warehouseFile = path_1.default.join(dataDir, "warehouse.json");
exports.WAREHOUSE_RESOURCES = {
    wheat: {
        id: "wheat",
        name: "Trigo",
        emoji: "🌾",
        buyPrice: 0.16,
        sellPrice: 0.1,
    },
    honey: {
        id: "honey",
        name: "Mel",
        emoji: "🍯",
        buyPrice: 38,
        sellPrice: 25,
    },
    cattle: {
        id: "cattle",
        name: "Gado",
        emoji: "🐄",
        buyPrice: 6710,
        sellPrice: 5000,
    },
};
function getDefaultWarehouse() {
    return {
        stock: {
            wheat: 0,
            honey: 0,
            cattle: 0,
        },
        treasury: 0,
        prices: {
            wheat: { buy: 0.16, sell: 0.1 },
            honey: { buy: 38, sell: 25 },
            cattle: { buy: 6710, sell: 5000 },
        },
        statistics: {
            hourly: {
                wheat: { sold: 0, bought: 0, revenue: 0 },
                honey: { sold: 0, bought: 0, revenue: 0 },
                cattle: { sold: 0, bought: 0, revenue: 0 },
            },
            total: {
                wheat: { sold: 0, bought: 0, revenue: 0 },
                honey: { sold: 0, bought: 0, revenue: 0 },
                cattle: { sold: 0, bought: 0, revenue: 0 },
            },
            lastReset: null,
        },
        transactions: [],
    };
}
function getWarehouseData() {
    const cached = cacheManager_1.cacheManager.get("warehouse", "state");
    if (cached !== null) {
        return cached;
    }
    try {
        if (!fs_1.default.existsSync(warehouseFile)) {
            const defaultData = getDefaultWarehouse();
            fs_1.default.writeFileSync(warehouseFile, JSON.stringify(defaultData, null, 2));
            cacheManager_1.cacheManager.set("warehouse", "state", defaultData, false);
            return defaultData;
        }
        const data = fs_1.default.readFileSync(warehouseFile, "utf8");
        const warehouse = JSON.parse(data);
        let needsUpdate = false;
        if (warehouse.treasury === undefined) {
            warehouse.treasury = 0;
            needsUpdate = true;
            console.log("💰 Warehouse treasury initialized");
        }
        for (const resourceId in exports.WAREHOUSE_RESOURCES) {
            const resource = exports.WAREHOUSE_RESOURCES[resourceId];
            if (!warehouse.prices[resourceId] ||
                warehouse.prices[resourceId].buy !== resource.buyPrice ||
                warehouse.prices[resourceId].sell !== resource.sellPrice) {
                warehouse.prices[resourceId] = {
                    buy: resource.buyPrice,
                    sell: resource.sellPrice,
                };
                needsUpdate = true;
            }
        }
        if (needsUpdate) {
            console.log("📊 Warehouse prices updated to match current configuration");
            fs_1.default.writeFileSync(warehouseFile, JSON.stringify(warehouse, null, 2));
        }
        cacheManager_1.cacheManager.set("warehouse", "state", warehouse, false);
        return warehouse;
    }
    catch (error) {
        console.error("Error reading warehouse data:", error);
        const defaultData = getDefaultWarehouse();
        cacheManager_1.cacheManager.set("warehouse", "state", defaultData, true);
        return defaultData;
    }
}
function saveWarehouseData(data) {
    try {
        fs_1.default.writeFileSync(warehouseFile, JSON.stringify(data, null, 2));
        cacheManager_1.cacheManager.set("warehouse", "state", data, false);
    }
    catch (error) {
        console.error("Error saving warehouse data:", error);
        throw error;
    }
}
function addStock(resource, amount) {
    const warehouse = getWarehouseData();
    warehouse.stock[resource] = (warehouse.stock[resource] || 0) + amount;
    saveWarehouseData(warehouse);
}
function removeStock(resource, amount) {
    const warehouse = getWarehouseData();
    if ((warehouse.stock[resource] || 0) < amount) {
        return false;
    }
    warehouse.stock[resource] -= amount;
    saveWarehouseData(warehouse);
    return true;
}
function getStock(resource) {
    const warehouse = getWarehouseData();
    return warehouse.stock[resource] || 0;
}
function recordTransaction(userId, type, resource, amount, price) {
    const warehouse = getWarehouseData();
    const total = amount * price;
    warehouse.transactions.push({
        userId,
        type,
        resource,
        amount,
        price,
        total,
        timestamp: new Date().toISOString(),
    });
    if (warehouse.transactions.length > 1000) {
        warehouse.transactions = warehouse.transactions.slice(-500);
    }
    if (type === "sell") {
        warehouse.statistics.hourly[resource].sold += amount;
        warehouse.statistics.total[resource].sold += amount;
        warehouse.statistics.hourly[resource].revenue += total;
        warehouse.statistics.total[resource].revenue += total;
    }
    else {
        warehouse.statistics.hourly[resource].bought += amount;
        warehouse.statistics.total[resource].bought += amount;
    }
    saveWarehouseData(warehouse);
}
function resetHourlyStats() {
    const warehouse = getWarehouseData();
    warehouse.statistics.hourly = {
        wheat: { sold: 0, bought: 0, revenue: 0 },
        honey: { sold: 0, bought: 0, revenue: 0 },
        cattle: { sold: 0, bought: 0, revenue: 0 },
    };
    warehouse.statistics.lastReset = new Date().toISOString();
    saveWarehouseData(warehouse);
}
function getPrice(resource, type) {
    const warehouse = getWarehouseData();
    return warehouse.prices[resource]?.[type] || 0;
}
function getTotalValue() {
    const warehouse = getWarehouseData();
    let total = 0;
    for (const resource in warehouse.stock) {
        const amount = warehouse.stock[resource];
        const price = warehouse.prices[resource]?.sell || 0;
        total += amount * price;
    }
    return total;
}
function addTreasury(amount) {
    const warehouse = getWarehouseData();
    warehouse.treasury = (warehouse.treasury || 0) + amount;
    saveWarehouseData(warehouse);
}
function removeTreasury(amount) {
    const warehouse = getWarehouseData();
    const currentTreasury = warehouse.treasury || 0;
    if (currentTreasury < amount) {
        return false;
    }
    warehouse.treasury = currentTreasury - amount;
    saveWarehouseData(warehouse);
    return true;
}
function getTreasury() {
    const warehouse = getWarehouseData();
    return warehouse.treasury || 0;
}
function getWarehouseStats() {
    const warehouse = getWarehouseData();
    return {
        stock: warehouse.stock,
        treasury: warehouse.treasury || 0,
        prices: warehouse.prices,
        statistics: warehouse.statistics,
        totalValue: getTotalValue(),
    };
}
function startWarehouseStatsReset() {
    console.log("📊 Starting warehouse statistics hourly reset system");
    resetHourlyStats();
    const interval = setInterval(() => {
        try {
            resetHourlyStats();
            console.log("📊 Warehouse hourly statistics reset");
        }
        catch (error) {
            console.error("❌ Error resetting warehouse statistics:", error);
        }
    }, 60 * 60 * 1000);
    return interval;
}
//# sourceMappingURL=warehouseManager.js.map