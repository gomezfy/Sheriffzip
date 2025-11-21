interface BankAccount {
    saloon_tokens: number;
    silver: number;
    lastUpdate: number;
}
export declare function getBankAccount(userId: string): BankAccount;
export declare function saveBankAccount(userId: string, account: BankAccount): void;
/**
 * Deposit saloon tokens from wallet to bank
 */
export declare function depositTokens(userId: string, amount: number): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Withdraw saloon tokens from bank to wallet
 */
export declare function withdrawTokens(userId: string, amount: number): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Deposit silver from wallet to bank
 */
export declare function depositSilver(userId: string, amount: number): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Withdraw silver from bank to wallet
 */
export declare function withdrawSilver(userId: string, amount: number): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Get total wealth (wallet + bank)
 */
export declare function getTotalWealth(userId: string): {
    tokens: number;
    silver: number;
    total: number;
};
export {};
//# sourceMappingURL=bankManager.d.ts.map