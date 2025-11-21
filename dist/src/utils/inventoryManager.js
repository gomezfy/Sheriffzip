"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPGRADE_TIERS = exports.MAX_WEIGHT = exports.ITEMS = void 0;
exports.getInventory = getInventory;
exports.saveInventory = saveInventory;
exports.calculateWeight = calculateWeight;
exports.checkCapacity = checkCapacity;
exports.addItem = addItem;
exports.removeItem = removeItem;
exports.getItem = getItem;
exports.transferItem = transferItem;
exports.getBackpackLevel = getBackpackLevel;
exports.getNextUpgrade = getNextUpgrade;
exports.getTopUsers = getTopUsers;
exports.upgradeBackpack = upgradeBackpack;
exports.getItemDurability = getItemDurability;
exports.reduceDurability = reduceDurability;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const customEmojis_1 = require("./customEmojis");
const cacheManager_1 = require("./cacheManager");
const database_1 = require("./database");
const transactionLock_1 = require("./transactionLock");
const dataDir = (0, database_1.getDataPath)("data");
const inventoryFile = path_1.default.join(dataDir, "inventory.json");
exports.ITEMS = {
    saloon_token: {
        name: "Saloon Token",
        emoji: customEmojis_1.EMOJI_TEXT.SALOON_TOKEN,
        customEmoji: "SALOON_TOKEN",
        weight: 0.0000005,
        stackable: true,
        description: "Main saloon currency",
    },
    seal: {
        name: "Selo",
        emoji: "🎟️",
        weight: 0.000001,
        stackable: true,
        description: "Selo especial usado para expedições e documentos oficiais",
    },
    silver: {
        name: "Silver Coin",
        emoji: customEmojis_1.EMOJI_TEXT.SILVER_COIN,
        weight: 0.000005,
        stackable: true,
        description: "Valuable silver coin",
    },
    gold: {
        name: "Ouro",
        emoji: customEmojis_1.EMOJI_TEXT.GOLD_BAR,
        customEmoji: "gold_bar",
        weight: 1,
        stackable: true,
        description: "Barra de ouro preciosa obtida através da mineração",
    },
    diamond: {
        name: "Diamond",
        emoji: customEmojis_1.EMOJI_TEXT.GEM,
        customEmoji: "gem",
        weight: 0.1,
        stackable: true,
        description: "Rare diamond found in mining and bank robberies",
    },
    pickaxe: {
        name: "Picareta",
        emoji: customEmojis_1.EMOJI_TEXT.PICKAXE,
        customEmoji: "pickaxe",
        weight: 2,
        stackable: false,
        description: "Uma picareta lendária que aumenta massivamente sua produção de ouro na mineração solo (16-28 barras ao invés de 1-3)",
        maxDurability: 20,
    },
    honey: {
        name: "Mel",
        emoji: "🍯",
        weight: 0.05,
        stackable: true,
        description: "Mel doce de abelhas selvagens, encontrado em expedições",
    },
    wheat: {
        name: "Trigo",
        emoji: "🌾",
        weight: 0.0005,
        stackable: true,
        description: "Trigo dourado colhido durante expedições",
    },
    cattle: {
        name: "Cattle",
        emoji: "🐄",
        weight: 1,
        stackable: true,
        description: "Cattle from your ranch, valuable livestock for trading",
    },
    escopeta: {
        name: "Escopeta",
        emoji: customEmojis_1.EMOJI_TEXT.ESCOPETA,
        customEmoji: "ESCOPETA",
        weight: 3.5,
        stackable: false,
        description: "Uma escopeta potente, perfeita para defesa e caça no velho oeste",
        damage: 85,
        imageUrl: "https://i.postimg.cc/2yQnJftN/ACC0B258-8EC0-4029-96C0-5D68DE02FBF1.png",
        price: 5000,
        currency: "silver",
        maxDurability: 60,
    },
    revolver_vaqueiro: {
        name: "Revólver de Vaqueiro",
        emoji: customEmojis_1.EMOJI_TEXT.REVOLVER_VAQUEIRO,
        customEmoji: "REVOLVER_VAQUEIRO",
        weight: 2.0,
        stackable: false,
        description: "O clássico revólver de todo vaqueiro, rápido e confiável",
        damage: 65,
        imageUrl: "https://i.postimg.cc/59Bvfbs5/D9466B53-9F8A-4CB6-A12B-8635841C335D.png",
        price: 3500,
        currency: "silver",
        maxDurability: 70,
    },
    revolver_38: {
        name: "Revólver Calibre 38",
        emoji: customEmojis_1.EMOJI_TEXT.REVOLVER_38,
        customEmoji: "REVOLVER_38",
        weight: 1.8,
        stackable: false,
        description: "Um revólver calibre 38 preciso, ideal para tiroteios rápidos",
        damage: 55,
        imageUrl: "https://i.postimg.cc/fbdy5fF8/80976BEE-60A3-4041-8E6B-3624D04A7379.png",
        price: 2500,
        currency: "silver",
        maxDurability: 80,
    },
    rifle_de_caca: {
        name: "Rifle De Caça",
        emoji: customEmojis_1.EMOJI_TEXT.RIFLE_DE_CACA,
        customEmoji: "RIFLE_DE_CACA",
        weight: 3.4,
        stackable: false,
        description: "Rifle de longo alcance perfeito para caçadores experientes do oeste",
        damage: 120,
        imageUrl: "https://i.postimg.cc/x1RwNg2d/IMG-3445.png",
        price: 7500,
        currency: "silver",
        maxDurability: 50,
    },
    basic_bait: {
        name: "Isca Básica",
        emoji: "🪱",
        weight: 0.01,
        stackable: true,
        description: "Minhoca comum para pesca básica. Atrai peixes comuns e incomuns.",
        price: 5,
        currency: "silver",
    },
    premium_bait: {
        name: "Isca Premium",
        emoji: "🦗",
        weight: 0.01,
        stackable: true,
        description: "Grilo vivo de qualidade superior. Aumenta muito a chance de pescar peixes raros, épicos e lendários!",
        price: 12,
        currency: "silver",
    },
    deer_meat: {
        name: "Carne de Cervo",
        emoji: "🥩",
        weight: 2,
        stackable: true,
        description: "Carne fresca de cervo, valiosa para venda ou consumo",
        price: 150,
        currency: "silver",
    },
    deer_pelt: {
        name: "Pele de Cervo",
        emoji: customEmojis_1.EMOJI_TEXT.DEER_PELT,
        customEmoji: "DEER_PELT",
        weight: 1.5,
        stackable: true,
        description: "Pele de cervo de qualidade, procurada por comerciantes",
        price: 200,
        currency: "silver",
        imageUrl: "https://i.postimg.cc/sgnByvcZ/E73819F8-3974-4895-9587-003D27307C3C.png",
    },
    rabbit_meat: {
        name: "Carne de Coelho",
        emoji: "🍖",
        weight: 0.5,
        stackable: true,
        description: "Carne tenra de coelho selvagem",
        price: 50,
        currency: "silver",
    },
    rabbit_pelt: {
        name: "Pele de Coelho",
        emoji: customEmojis_1.EMOJI_TEXT.RABBIT_PELT,
        customEmoji: "RABBIT_PELT",
        weight: 0.3,
        stackable: true,
        description: "Pele macia de coelho",
        price: 75,
        currency: "silver",
        imageUrl: "https://i.postimg.cc/s2XhZpxf/D235FB82-9508-4A97-AE1C-9E1E4C6CC5AA.png",
    },
    bear_meat: {
        name: "Carne de Urso",
        emoji: "🥩",
        weight: 5,
        stackable: true,
        description: "Carne robusta de urso, extremamente valiosa",
        price: 500,
        currency: "silver",
    },
    bear_pelt: {
        name: "Pele de Urso",
        emoji: customEmojis_1.EMOJI_TEXT.BEAR_PELT,
        customEmoji: "BEAR_PELT",
        weight: 8,
        stackable: true,
        description: "Pele grossa de urso, troféu raro de caçador",
        price: 800,
        currency: "silver",
        imageUrl: "https://i.postimg.cc/52GxnvpN/90170D80-51C3-4CC0-8824-308AA796034A.png",
    },
    bison_meat: {
        name: "Carne de Bisão",
        emoji: "🥩",
        weight: 6,
        stackable: true,
        description: "Carne premium de bisão selvagem",
        price: 400,
        currency: "silver",
    },
    bison_pelt: {
        name: "Pele de Bisão",
        emoji: customEmojis_1.EMOJI_TEXT.BISON_PELT,
        customEmoji: "BISON_PELT",
        weight: 7,
        stackable: true,
        description: "Pele resistente de bisão americano",
        price: 600,
        currency: "silver",
        imageUrl: "https://i.postimg.cc/MGMGStXj/E7B908CE-3E40-4D73-A89C-54712A1935DA.png",
    },
    wolf_meat: {
        name: "Carne de Lobo",
        emoji: "🥩",
        weight: 3,
        stackable: true,
        description: "Carne de lobo cinzento",
        price: 250,
        currency: "silver",
    },
    wolf_pelt: {
        name: "Pele de Lobo",
        emoji: customEmojis_1.EMOJI_TEXT.WOLF_PELT,
        customEmoji: "WOLF_PELT",
        weight: 2,
        stackable: true,
        description: "Pele espessa de lobo, muito procurada",
        price: 350,
        currency: "silver",
        imageUrl: "https://i.postimg.cc/rsCmHmsZ/F973B0C2-BE9C-4114-8A2E-C851F99A510A.png",
    },
    eagle_feather: {
        name: "Pena de Águia",
        emoji: "🪶",
        weight: 0.01,
        stackable: true,
        description: "Pena rara de águia dourada, símbolo de prestígio",
        price: 1000,
        currency: "silver",
    },
    fishing_rod: {
        name: "Vara de Pesca",
        emoji: "🎣",
        weight: 1.5,
        stackable: false,
        description: "Vara de pesca profissional para pescar nos rios do oeste",
        damage: 0,
        price: 5000,
        currency: "silver",
        maxDurability: 40,
    },
    catfish: {
        name: "Bagre do Rio",
        emoji: "🐟",
        weight: 1.5,
        stackable: true,
        description: "Bagre comum pescado nos rios do oeste",
        price: 80,
        currency: "silver",
    },
    silver_trout: {
        name: "Truta Prateada",
        emoji: "🐟",
        weight: 2,
        stackable: true,
        description: "Truta prateada de qualidade média",
        price: 180,
        currency: "silver",
    },
    wild_salmon: {
        name: "Salmão Selvagem",
        emoji: "🐟",
        weight: 3,
        stackable: true,
        description: "Salmão selvagem raro e valioso",
        price: 350,
        currency: "silver",
    },
    giant_pike: {
        name: "Lúcio Gigante",
        emoji: "🐟",
        weight: 5,
        stackable: true,
        description: "Lúcio gigante, uma pesca épica!",
        price: 700,
        currency: "silver",
    },
    golden_sturgeon: {
        name: "Esturjão Dourado",
        emoji: "🐠",
        weight: 8,
        stackable: true,
        description: "Esturjão dourado lendário, extremamente valioso",
        price: 1200,
        currency: "silver",
    },
    mythic_western_fish: {
        name: "Peixe Mítico do Oeste",
        emoji: "🐡",
        weight: 10,
        stackable: true,
        description: "Peixe mítico lendário das águas do oeste, raríssimo!",
        price: 2500,
        currency: "silver",
    },
};
exports.MAX_WEIGHT = 100;
// Ensure data directory exists
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
// Ensure inventory file exists
if (!fs_1.default.existsSync(inventoryFile)) {
    fs_1.default.writeFileSync(inventoryFile, JSON.stringify({}, null, 2));
}
function getInventory(userId) {
    const defaultInventory = {
        items: {},
        weight: 0,
        maxWeight: exports.MAX_WEIGHT,
        itemDurability: {},
        purchasedBackpacks: [],
    };
    const cached = cacheManager_1.cacheManager.get("inventory", userId);
    if (cached !== null) {
        if (!cached.maxWeight) {
            cached.maxWeight = exports.MAX_WEIGHT;
        }
        if (!cached.itemDurability) {
            cached.itemDurability = {};
        }
        if (!cached.purchasedBackpacks) {
            cached.purchasedBackpacks = [];
        }
        return cached;
    }
    try {
        const data = fs_1.default.readFileSync(inventoryFile, "utf8");
        const inventories = JSON.parse(data);
        if (!inventories[userId]) {
            cacheManager_1.cacheManager.set("inventory", userId, defaultInventory, true);
            return defaultInventory;
        }
        if (!inventories[userId].maxWeight) {
            inventories[userId].maxWeight = exports.MAX_WEIGHT;
        }
        if (!inventories[userId].itemDurability) {
            inventories[userId].itemDurability = {};
        }
        if (!inventories[userId].purchasedBackpacks) {
            inventories[userId].purchasedBackpacks = [];
        }
        cacheManager_1.cacheManager.set("inventory", userId, inventories[userId], false);
        return inventories[userId];
    }
    catch (error) {
        console.error("Error reading inventory:", error);
        cacheManager_1.cacheManager.set("inventory", userId, defaultInventory, true);
        return defaultInventory;
    }
}
function saveInventory(userId, inventory) {
    if (!inventory.maxWeight || inventory.maxWeight < exports.MAX_WEIGHT) {
        const existing = cacheManager_1.cacheManager.get("inventory", userId);
        if (existing && existing.maxWeight > exports.MAX_WEIGHT) {
            inventory.maxWeight = existing.maxWeight;
        }
        else {
            inventory.maxWeight = exports.MAX_WEIGHT;
        }
    }
    cacheManager_1.cacheManager.set("inventory", userId, inventory, true);
}
function calculateWeight(inventory) {
    let totalWeight = 0;
    for (const [itemId, quantity] of Object.entries(inventory.items)) {
        if (exports.ITEMS[itemId]) {
            totalWeight += exports.ITEMS[itemId].weight * quantity;
        }
    }
    return Math.round(totalWeight * 1000) / 1000;
}
function checkCapacity(inventory, itemId, quantity) {
    const itemInfo = exports.ITEMS[itemId];
    if (!itemInfo) {
        // Or handle as an error, depending on desired behavior for unknown items
        return { hasCapacity: false, required: 0 };
    }
    const additionalWeight = itemInfo.weight * quantity;
    const currentWeight = calculateWeight(inventory);
    // Round the total weight to avoid floating point precision issues
    const totalWeight = Math.round((currentWeight + additionalWeight) * 1000) / 1000;
    return {
        hasCapacity: totalWeight <= inventory.maxWeight,
        required: additionalWeight,
    };
}
async function addItem(userId, itemId, quantity = 1) {
    return await transactionLock_1.transactionLock.withLock(userId, () => {
        const inventory = getInventory(userId);
        if (!exports.ITEMS[itemId]) {
            return { success: false, error: "Item not found!" };
        }
        const capacityResult = checkCapacity(inventory, itemId, quantity);
        if (!capacityResult.hasCapacity) {
            return {
                success: false,
                error: "🚫 You're carrying too much weight!",
                currentWeight: calculateWeight(inventory),
                maxWeight: inventory.maxWeight,
                additionalWeight: capacityResult.required,
            };
        }
        if (!inventory.items[itemId]) {
            inventory.items[itemId] = 0;
        }
        inventory.items[itemId] += quantity;
        if (!inventory.itemDurability) {
            inventory.itemDurability = {};
        }
        const item = exports.ITEMS[itemId];
        if (item.maxDurability && !inventory.itemDurability[itemId]) {
            inventory.itemDurability[itemId] = item.maxDurability;
        }
        const newWeight = calculateWeight(inventory);
        inventory.weight = newWeight;
        saveInventory(userId, inventory);
        return {
            success: true,
            item: exports.ITEMS[itemId],
            quantity: quantity,
            newWeight: newWeight,
            totalQuantity: inventory.items[itemId],
        };
    });
}
async function removeItem(userId, itemId, quantity = 1) {
    return await transactionLock_1.transactionLock.withLock(userId, () => {
        const inventory = getInventory(userId);
        if (!inventory.items[itemId] || inventory.items[itemId] < quantity) {
            return { success: false, error: "You don't have enough items!" };
        }
        inventory.items[itemId] -= quantity;
        if (inventory.items[itemId] <= 0) {
            delete inventory.items[itemId];
        }
        inventory.weight = calculateWeight(inventory);
        saveInventory(userId, inventory);
        return {
            success: true,
            item: exports.ITEMS[itemId],
            quantity: quantity,
            newWeight: inventory.weight,
            remainingQuantity: inventory.items[itemId] || 0,
        };
    });
}
function getItem(userId, itemId) {
    const inventory = getInventory(userId);
    return inventory.items[itemId] || 0;
}
async function transferItem(fromUserId, toUserId, itemId, quantity) {
    return await transactionLock_1.transactionLock.withMultipleLocks([fromUserId, toUserId], () => {
        const fromInventory = getInventory(fromUserId);
        const toInventory = getInventory(toUserId);
        // Check sender's balance
        if (!fromInventory.items[itemId] || fromInventory.items[itemId] < quantity) {
            return { success: false, error: "You don't have enough items!" };
        }
        // Check recipient's capacity
        const capacityResult = checkCapacity(toInventory, itemId, quantity);
        if (!capacityResult.hasCapacity) {
            return {
                success: false,
                error: "The recipient does not have enough space in their inventory.",
            };
        }
        const itemInfo = exports.ITEMS[itemId];
        if (!itemInfo) {
            return { success: false, error: "Item not found!" };
        }
        // All checks passed, now perform the state changes in memory
        fromInventory.items[itemId] -= quantity;
        if (fromInventory.items[itemId] <= 0) {
            delete fromInventory.items[itemId];
        }
        fromInventory.weight = calculateWeight(fromInventory);
        if (!toInventory.items[itemId]) {
            toInventory.items[itemId] = 0;
        }
        toInventory.items[itemId] += quantity;
        toInventory.weight = calculateWeight(toInventory);
        // Now, save both inventories.
        saveInventory(fromUserId, fromInventory);
        saveInventory(toUserId, toInventory);
        return { success: true, item: itemInfo, quantity: quantity };
    });
}
exports.UPGRADE_TIERS = [
    { level: 1, capacity: 100, cost: 0, currency: null },
    { level: 2, capacity: 200, cost: 5000, currency: "silver" },
    { level: 3, capacity: 300, cost: 10000, currency: "silver" },
    { level: 4, capacity: 400, cost: 20000, currency: "silver" },
    { level: 5, capacity: 500, cost: 50000, currency: "silver" },
];
function getBackpackLevel(userId) {
    const inventory = getInventory(userId);
    const currentCapacity = inventory.maxWeight;
    for (let i = exports.UPGRADE_TIERS.length - 1; i >= 0; i--) {
        if (currentCapacity >= exports.UPGRADE_TIERS[i].capacity) {
            return exports.UPGRADE_TIERS[i].level;
        }
    }
    return 1;
}
function getNextUpgrade(userId) {
    const inventory = getInventory(userId);
    const currentCapacity = inventory.maxWeight;
    const websiteUpgrades = [
        { capacity: 200, price: "2.99" },
        { capacity: 300, price: "4.99" },
        { capacity: 400, price: "6.99" },
        { capacity: 500, price: "9.99" },
    ];
    for (const upgrade of websiteUpgrades) {
        if (currentCapacity < upgrade.capacity) {
            return { capacity: upgrade.capacity, price: upgrade.price };
        }
    }
    return null;
}
function getTopUsers(itemType, limit = 10) {
    const data = fs_1.default.readFileSync(inventoryFile, "utf8");
    const inventories = JSON.parse(data);
    const userAmounts = [];
    for (const userId in inventories) {
        const inventory = inventories[userId];
        const amount = inventory.items[itemType] || 0;
        if (amount > 0) {
            userAmounts.push({ userId, amount });
        }
    }
    userAmounts.sort((a, b) => b.amount - a.amount);
    return userAmounts.slice(0, limit);
}
async function upgradeBackpack(userId, newCapacity) {
    const inventory = getInventory(userId);
    const currentLevel = getBackpackLevel(userId);
    if (newCapacity !== undefined) {
        if (newCapacity <= inventory.maxWeight) {
            return {
                success: false,
                error: "New capacity must be greater than current!",
            };
        }
        const validCapacities = [200, 300, 400, 500];
        if (!validCapacities.includes(newCapacity)) {
            return { success: false, error: "Invalid capacity tier!" };
        }
        const oldCapacity = inventory.maxWeight;
        inventory.maxWeight = newCapacity;
        saveInventory(userId, inventory);
        return {
            success: true,
            oldCapacity: oldCapacity,
            newCapacity: newCapacity,
            level: getBackpackLevel(userId),
        };
    }
    if (currentLevel >= exports.UPGRADE_TIERS.length) {
        return { success: false, error: "Already at maximum capacity!" };
    }
    const nextTier = exports.UPGRADE_TIERS[currentLevel];
    if (nextTier.currency && nextTier.cost > 0) {
        const userCurrency = getItem(userId, nextTier.currency);
        if (userCurrency < nextTier.cost) {
            return {
                success: false,
                error: `Not enough ${nextTier.currency}!`,
                required: nextTier.cost,
                current: userCurrency,
                missing: nextTier.cost - userCurrency,
            };
        }
        const removeResult = await removeItem(userId, nextTier.currency, nextTier.cost);
        if (!removeResult.success) {
            return removeResult;
        }
    }
    const oldCapacity = inventory.maxWeight;
    inventory.maxWeight = nextTier.capacity;
    saveInventory(userId, inventory);
    return {
        success: true,
        oldCapacity: oldCapacity,
        newCapacity: nextTier.capacity,
        level: nextTier.level,
        cost: nextTier.cost,
        currency: nextTier.currency,
    };
}
function getItemDurability(userId, itemId) {
    const inventory = getInventory(userId);
    const item = exports.ITEMS[itemId];
    if (!item || !item.maxDurability) {
        return null;
    }
    if (!inventory.itemDurability) {
        return null;
    }
    return inventory.itemDurability[itemId] ?? item.maxDurability;
}
async function reduceDurability(userId, itemId, amount = 1) {
    return await transactionLock_1.transactionLock.withLock(userId, () => {
        const inventory = getInventory(userId);
        const item = exports.ITEMS[itemId];
        if (!item || !item.maxDurability) {
            return { success: false, durability: 0, broken: false };
        }
        if (!inventory.items[itemId] || inventory.items[itemId] <= 0) {
            return { success: false, durability: 0, broken: false };
        }
        if (!inventory.itemDurability) {
            inventory.itemDurability = {};
        }
        if (!inventory.itemDurability[itemId]) {
            inventory.itemDurability[itemId] = item.maxDurability;
        }
        inventory.itemDurability[itemId] -= amount;
        if (inventory.itemDurability[itemId] <= 0) {
            delete inventory.items[itemId];
            delete inventory.itemDurability[itemId];
            inventory.weight = calculateWeight(inventory);
            saveInventory(userId, inventory);
            return {
                success: true,
                durability: 0,
                broken: true,
                item: item,
            };
        }
        saveInventory(userId, inventory);
        return {
            success: true,
            durability: inventory.itemDurability[itemId],
            broken: false,
            item: item,
        };
    });
}
//# sourceMappingURL=inventoryManager.js.map