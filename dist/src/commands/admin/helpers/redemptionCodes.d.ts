export interface RedemptionCode {
    productId: string;
    productName: string;
    tokens: number;
    coins: number;
    vip: boolean;
    background: boolean;
    backpack?: number | boolean;
    rexBucks?: number;
    createdAt: number;
    createdBy: string;
    redeemed: boolean;
}
export interface Product {
    name: string;
    tokens: number;
    coins: number;
    vip: boolean;
    background: boolean;
    backpack?: number | boolean;
    rexBucks?: number;
}
export declare const PRODUCTS: Record<string, Product>;
export declare function loadRedemptionCodes(): Record<string, RedemptionCode>;
export declare function saveRedemptionCodes(data: Record<string, RedemptionCode>): void;
export declare function generateRedemptionCode(productId: string): string;
//# sourceMappingURL=redemptionCodes.d.ts.map