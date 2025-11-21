"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRedemptionCode = createRedemptionCode;
exports.redeemCodeAndApplyRewards = redeemCodeAndApplyRewards;
exports.getRedemptionCode = getRedemptionCode;
exports.getAllRedemptionCodes = getAllRedemptionCodes;
exports.deleteRedemptionCode = deleteRedemptionCode;
const db_1 = require("../../server/db");
const schema_1 = require("../../shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
async function createRedemptionCode(codeData) {
    try {
        const [newCode] = await db_1.db
            .insert(schema_1.redemptionCodes)
            .values(codeData)
            .returning();
        console.log(`✅ Redemption code created: ${newCode.code}`);
        return {
            success: true,
            code: newCode.code,
        };
    }
    catch (error) {
        console.error("Error creating redemption code:", error);
        if (error instanceof Error && error.message.includes("unique constraint")) {
            return {
                success: false,
                error: "Code already exists",
            };
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
async function redeemCodeAndApplyRewards(code, userId, username) {
    try {
        return await db_1.db.transaction(async (tx) => {
            const [redemption] = await tx
                .select()
                .from(schema_1.redemptionCodes)
                .where((0, drizzle_orm_1.eq)(schema_1.redemptionCodes.code, code))
                .limit(1)
                .for("update");
            if (!redemption) {
                return {
                    success: false,
                    error: "Invalid redemption code",
                    errorType: "NOT_FOUND",
                };
            }
            if (redemption.redeemed) {
                return {
                    success: false,
                    code: redemption,
                    error: "Code already redeemed",
                    errorType: "ALREADY_REDEEMED",
                };
            }
            const [existingUser] = await tx
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.userId, userId))
                .limit(1)
                .for("update");
            if (!existingUser) {
                await tx.insert(schema_1.users).values({
                    userId,
                    username,
                    rexBucks: redemption.rexBucks || 0,
                    saloonTokens: redemption.tokens || 0,
                    silver: redemption.coins || 0,
                    backpackCapacity: redemption.backpack || 100,
                    isVip: redemption.vip || false,
                    customBackground: redemption.background ? 'premium' : null,
                });
            }
            else {
                if (redemption.backpack && existingUser.backpackCapacity >= redemption.backpack) {
                    return {
                        success: false,
                        error: "Backpack upgrade not needed",
                        errorType: "UPGRADE_NOT_NEEDED",
                        currentInventoryCapacity: existingUser.backpackCapacity,
                        targetInventoryCapacity: redemption.backpack,
                    };
                }
                const updateData = {
                    rexBucks: existingUser.rexBucks + (redemption.rexBucks || 0),
                    saloonTokens: existingUser.saloonTokens + (redemption.tokens || 0),
                    silver: existingUser.silver + (redemption.coins || 0),
                    backpackCapacity: redemption.backpack || existingUser.backpackCapacity,
                };
                if (redemption.vip) {
                    updateData.isVip = true;
                }
                if (redemption.background) {
                    updateData.customBackground = 'premium';
                }
                await tx
                    .update(schema_1.users)
                    .set(updateData)
                    .where((0, drizzle_orm_1.eq)(schema_1.users.userId, userId));
            }
            if (redemption.tokens > 0) {
                await tx.execute((0, drizzle_orm_1.sql) `
          INSERT INTO inventory_items (id, user_id, item_id, name, quantity, weight, value, type)
          VALUES (${crypto_1.default.randomBytes(8).toString("hex")}, ${userId}, 'saloon_token', 'Saloon Token', ${redemption.tokens}, 0.01, 10, 'currency')
          ON CONFLICT (user_id, item_id) 
          DO UPDATE SET quantity = inventory_items.quantity + ${redemption.tokens}
        `);
            }
            if (redemption.coins > 0) {
                await tx.execute((0, drizzle_orm_1.sql) `
          INSERT INTO inventory_items (id, user_id, item_id, name, quantity, weight, value, type)
          VALUES (${crypto_1.default.randomBytes(8).toString("hex")}, ${userId}, 'silver', 'Silver Coins', ${redemption.coins}, 0.01, 1, 'currency')
          ON CONFLICT (user_id, item_id)
          DO UPDATE SET quantity = inventory_items.quantity + ${redemption.coins}
        `);
            }
            const [updatedCode] = await tx
                .update(schema_1.redemptionCodes)
                .set({
                redeemed: true,
                redeemedBy: userId,
                redeemedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.redemptionCodes.code, code))
                .returning();
            console.log(`✅ Code redeemed atomically: ${code} by user ${userId} (${username})`);
            return {
                success: true,
                code: updatedCode,
            };
        });
    }
    catch (error) {
        console.error(`Error redeeming code ${code}:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            errorType: "UNKNOWN",
        };
    }
}
async function getRedemptionCode(code) {
    try {
        const [redemption] = await db_1.db
            .select()
            .from(schema_1.redemptionCodes)
            .where((0, drizzle_orm_1.eq)(schema_1.redemptionCodes.code, code))
            .limit(1);
        return redemption || null;
    }
    catch (error) {
        console.error(`Error getting redemption code ${code}:`, error);
        return null;
    }
}
async function getAllRedemptionCodes() {
    try {
        return await db_1.db.select().from(schema_1.redemptionCodes);
    }
    catch (error) {
        console.error("Error getting all redemption codes:", error);
        return [];
    }
}
async function deleteRedemptionCode(code) {
    try {
        await db_1.db.delete(schema_1.redemptionCodes).where((0, drizzle_orm_1.eq)(schema_1.redemptionCodes.code, code));
        console.log(`🗑️  Redemption code deleted: ${code}`);
        return true;
    }
    catch (error) {
        console.error(`Error deleting redemption code ${code}:`, error);
        return false;
    }
}
//# sourceMappingURL=redemptionCodeManager.js.map