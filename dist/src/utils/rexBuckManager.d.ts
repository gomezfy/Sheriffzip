interface RexBuckResult {
    success: boolean;
    newBalance: number;
    transactionId: string;
    error?: string;
}
interface UserRexBucksData {
    balance: number;
    totalTransactions: number;
}
export declare function getRexBuckBalance(userId: string): Promise<number>;
export declare function getUserRexBuckData(userId: string): Promise<UserRexBucksData>;
export declare function addRexBucks(userId: string, username: string, amount: number, type: "redeem" | "purchase" | "admin_add", redemptionCode?: string, metadata?: Record<string, any>): Promise<RexBuckResult>;
export declare function removeRexBucks(userId: string, amount: number, metadata?: Record<string, any>): Promise<RexBuckResult>;
export declare function getUserTransactionHistory(userId: string, limit?: number): Promise<{
    id: string;
    userId: string;
    amount: number;
    type: string;
    redemptionCode: string | null;
    balanceBefore: number;
    balanceAfter: number;
    metadata: unknown;
    timestamp: Date;
}[]>;
export declare function getAllTransactions(limit?: number): Promise<{
    id: string;
    userId: string;
    amount: number;
    type: string;
    redemptionCode: string | null;
    balanceBefore: number;
    balanceAfter: number;
    metadata: unknown;
    timestamp: Date;
}[]>;
export declare function getTransactionById(transactionId: string): Promise<{
    id: string;
    userId: string;
    amount: number;
    type: string;
    redemptionCode: string | null;
    balanceBefore: number;
    balanceAfter: number;
    metadata: unknown;
    timestamp: Date;
} | null>;
export declare function getRexBucksLeaderboard(limit?: number): Promise<{
    userId: string;
    username: string;
    balance: number;
}[]>;
export {};
//# sourceMappingURL=rexBuckManager.d.ts.map