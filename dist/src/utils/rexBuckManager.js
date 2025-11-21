"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRexBuckBalance = getRexBuckBalance;
exports.getUserRexBuckData = getUserRexBuckData;
exports.addRexBucks = addRexBucks;
exports.removeRexBucks = removeRexBucks;
exports.getUserTransactionHistory = getUserTransactionHistory;
exports.getAllTransactions = getAllTransactions;
exports.getTransactionById = getTransactionById;
exports.getRexBucksLeaderboard = getRexBucksLeaderboard;
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../../server/db");
const schema_1 = require("../../shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
async function getRexBuckBalance(userId) {
    try {
        const user = await db_1.db.select({ rexBucks: schema_1.users.rexBucks }).from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.userId, userId)).limit(1);
        return user[0]?.rexBucks ?? 0;
    }
    catch (error) {
        console.error(`Error getting RexBuck balance for ${userId}:`, error);
        return 0;
    }
}
async function getUserRexBuckData(userId) {
    try {
        const user = await db_1.db.select({ rexBucks: schema_1.users.rexBucks }).from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.userId, userId)).limit(1);
        const transactions = await db_1.db
            .select()
            .from(schema_1.rexBuckTransactions)
            .where((0, drizzle_orm_1.eq)(schema_1.rexBuckTransactions.userId, userId));
        return {
            balance: user[0]?.rexBucks ?? 0,
            totalTransactions: transactions.length,
        };
    }
    catch (error) {
        console.error(`Error getting RexBuck data for ${userId}:`, error);
        return { balance: 0, totalTransactions: 0 };
    }
}
async function addRexBucks(userId, username, amount, type, redemptionCode, metadata) {
    if (amount <= 0) {
        return {
            success: false,
            newBalance: 0,
            transactionId: "",
            error: "Amount must be positive",
        };
    }
    try {
        return await db_1.db.transaction(async (tx) => {
            const existingUser = await tx
                .select({ userId: schema_1.users.userId, username: schema_1.users.username, rexBucks: schema_1.users.rexBucks })
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.userId, userId))
                .limit(1)
                .for('update');
            let balanceBefore = 0;
            if (existingUser.length === 0) {
                const [newUser] = await tx.insert(schema_1.users).values({
                    userId,
                    username,
                    rexBucks: amount,
                }).returning();
                balanceBefore = 0;
            }
            else {
                balanceBefore = existingUser[0].rexBucks;
                await tx
                    .update(schema_1.users)
                    .set({ rexBucks: balanceBefore + amount })
                    .where((0, drizzle_orm_1.eq)(schema_1.users.userId, userId));
            }
            const balanceAfter = balanceBefore + amount;
            const transactionId = crypto_1.default.randomBytes(16).toString("hex");
            await tx.insert(schema_1.rexBuckTransactions).values({
                id: transactionId,
                userId,
                amount,
                type,
                redemptionCode,
                balanceBefore,
                balanceAfter,
                metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
            });
            console.log(`💵 RexBucks added: +${amount} to user ${userId} (${balanceBefore} → ${balanceAfter})`);
            return {
                success: true,
                newBalance: balanceAfter,
                transactionId,
            };
        });
    }
    catch (error) {
        console.error(`Error adding RexBucks for ${userId}:`, error);
        return {
            success: false,
            newBalance: 0,
            transactionId: "",
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
async function removeRexBucks(userId, amount, metadata) {
    if (amount <= 0) {
        return {
            success: false,
            newBalance: 0,
            transactionId: "",
            error: "Amount must be positive",
        };
    }
    try {
        return await db_1.db.transaction(async (tx) => {
            const user = await tx
                .select({ rexBucks: schema_1.users.rexBucks })
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.userId, userId))
                .limit(1)
                .for('update');
            if (user.length === 0 || user[0].rexBucks < amount) {
                throw new Error("Insufficient RexBucks balance");
            }
            const balanceBefore = user[0].rexBucks;
            const balanceAfter = balanceBefore - amount;
            await tx
                .update(schema_1.users)
                .set({ rexBucks: balanceAfter })
                .where((0, drizzle_orm_1.eq)(schema_1.users.userId, userId));
            const transactionId = crypto_1.default.randomBytes(16).toString("hex");
            await tx.insert(schema_1.rexBuckTransactions).values({
                id: transactionId,
                userId,
                amount: -amount,
                type: "admin_remove",
                balanceBefore,
                balanceAfter,
                metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
            });
            console.log(`💵 RexBucks removed: -${amount} from user ${userId} (${balanceBefore} → ${balanceAfter})`);
            return {
                success: true,
                newBalance: balanceAfter,
                transactionId,
            };
        });
    }
    catch (error) {
        console.error(`Error removing RexBucks from ${userId}:`, error);
        return {
            success: false,
            newBalance: 0,
            transactionId: "",
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
async function getUserTransactionHistory(userId, limit = 10) {
    try {
        const transactions = await db_1.db
            .select()
            .from(schema_1.rexBuckTransactions)
            .where((0, drizzle_orm_1.eq)(schema_1.rexBuckTransactions.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.rexBuckTransactions.timestamp))
            .limit(limit);
        return transactions;
    }
    catch (error) {
        console.error(`Error getting transaction history for ${userId}:`, error);
        return [];
    }
}
async function getAllTransactions(limit = 100) {
    try {
        return await db_1.db.select().from(schema_1.rexBuckTransactions).orderBy((0, drizzle_orm_1.desc)(schema_1.rexBuckTransactions.timestamp)).limit(limit);
    }
    catch (error) {
        console.error("Error getting all transactions:", error);
        return [];
    }
}
async function getTransactionById(transactionId) {
    try {
        const tx = await db_1.db
            .select()
            .from(schema_1.rexBuckTransactions)
            .where((0, drizzle_orm_1.eq)(schema_1.rexBuckTransactions.id, transactionId))
            .limit(1);
        return tx[0] || null;
    }
    catch (error) {
        console.error(`Error getting transaction ${transactionId}:`, error);
        return null;
    }
}
async function getRexBucksLeaderboard(limit = 10) {
    try {
        return await db_1.db
            .select({
            userId: schema_1.users.userId,
            username: schema_1.users.username,
            balance: schema_1.users.rexBucks,
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.gt)(schema_1.users.rexBucks, 0))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.users.rexBucks))
            .limit(limit);
    }
    catch (error) {
        console.error("Error getting RexBucks leaderboard:", error);
        return [];
    }
}
//# sourceMappingURL=rexBuckManager.js.map