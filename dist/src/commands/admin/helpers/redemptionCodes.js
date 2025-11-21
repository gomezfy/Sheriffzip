"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRODUCTS = void 0;
exports.loadRedemptionCodes = loadRedemptionCodes;
exports.saveRedemptionCodes = saveRedemptionCodes;
exports.generateRedemptionCode = generateRedemptionCode;
const database_1 = require("../../../utils/database");
exports.PRODUCTS = {
    starter: {
        name: "Starter Pack",
        tokens: 100,
        coins: 5000,
        vip: false,
        background: false,
    },
    popular: {
        name: "Popular Pack",
        tokens: 350,
        coins: 15000,
        vip: false,
        background: false,
    },
    gold: {
        name: "Gold Pack",
        tokens: 900,
        coins: 40000,
        vip: true,
        background: false,
    },
    ultimate: {
        name: "Ultimate Pack",
        tokens: 2500,
        coins: 100000,
        vip: true,
        background: true,
    },
    backpack_200: {
        name: "Small Backpack",
        tokens: 0,
        coins: 0,
        vip: false,
        background: false,
        backpack: 200,
    },
    backpack_300: {
        name: "Medium Backpack",
        tokens: 0,
        coins: 0,
        vip: false,
        background: false,
        backpack: 300,
    },
    backpack_400: {
        name: "Large Backpack",
        tokens: 0,
        coins: 0,
        vip: false,
        background: false,
        backpack: 400,
    },
    backpack_500: {
        name: "Ultimate Backpack",
        tokens: 0,
        coins: 0,
        vip: false,
        background: false,
        backpack: 500,
    },
    rexbucks_1000: {
        name: "💵 1,000 RexBucks",
        tokens: 0,
        coins: 0,
        vip: false,
        background: false,
        rexBucks: 1000,
    },
    rexbucks_5000: {
        name: "💵 5,000 RexBucks",
        tokens: 0,
        coins: 0,
        vip: false,
        background: false,
        rexBucks: 5000,
    },
    rexbucks_10000: {
        name: "💵 10,000 RexBucks",
        tokens: 0,
        coins: 0,
        vip: false,
        background: false,
        rexBucks: 10000,
    },
    rexbucks_25000: {
        name: "💵 25,000 RexBucks",
        tokens: 0,
        coins: 0,
        vip: false,
        background: false,
        rexBucks: 25000,
    },
    rexbucks_50000: {
        name: "💵 50,000 RexBucks",
        tokens: 0,
        coins: 0,
        vip: false,
        background: false,
        rexBucks: 50000,
    },
};
function loadRedemptionCodes() {
    try {
        return (0, database_1.readData)("redemption-codes.json");
    }
    catch (error) {
        console.error("Error loading redemption codes:", error);
        return {};
    }
}
function saveRedemptionCodes(data) {
    (0, database_1.writeData)("redemption-codes.json", data);
}
function generateRedemptionCode(productId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `SHERIFF-${productId.toUpperCase()}-${timestamp}-${random}`.toUpperCase();
}
//# sourceMappingURL=redemptionCodes.js.map