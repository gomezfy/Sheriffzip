import type { RedemptionCode, InsertRedemptionCode } from "../../shared/schema";
export interface RedemptionResult {
    success: boolean;
    code?: RedemptionCode;
    error?: string;
    errorType?: "NOT_FOUND" | "ALREADY_REDEEMED" | "INVALID_CODE" | "UNKNOWN" | "INSUFFICIENT_BALANCE" | "UPGRADE_NOT_NEEDED";
    currentInventoryCapacity?: number;
    targetInventoryCapacity?: number;
}
export interface CreateCodeResult {
    success: boolean;
    code?: string;
    error?: string;
}
export declare function createRedemptionCode(codeData: InsertRedemptionCode): Promise<CreateCodeResult>;
export declare function redeemCodeAndApplyRewards(code: string, userId: string, username: string): Promise<RedemptionResult>;
export declare function getRedemptionCode(code: string): Promise<RedemptionCode | null>;
export declare function getAllRedemptionCodes(): Promise<RedemptionCode[]>;
export declare function deleteRedemptionCode(code: string): Promise<boolean>;
//# sourceMappingURL=redemptionCodeManager.d.ts.map