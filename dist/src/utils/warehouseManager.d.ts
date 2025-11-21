export declare const WAREHOUSE_RESOURCES: {
    readonly wheat: {
        readonly id: "wheat";
        readonly name: "Trigo";
        readonly emoji: "🌾";
        readonly buyPrice: 0.16;
        readonly sellPrice: 0.1;
    };
    readonly honey: {
        readonly id: "honey";
        readonly name: "Mel";
        readonly emoji: "🍯";
        readonly buyPrice: 38;
        readonly sellPrice: 25;
    };
    readonly cattle: {
        readonly id: "cattle";
        readonly name: "Gado";
        readonly emoji: "🐄";
        readonly buyPrice: 6710;
        readonly sellPrice: 5000;
    };
};
interface WarehouseStats {
    sold: number;
    bought: number;
    revenue: number;
}
interface WarehouseData {
    stock: Record<string, number>;
    treasury: number;
    prices: Record<string, {
        buy: number;
        sell: number;
    }>;
    statistics: {
        hourly: Record<string, WarehouseStats>;
        total: Record<string, WarehouseStats>;
        lastReset: string | null;
    };
    transactions: Array<{
        userId: string;
        type: "sell" | "buy";
        resource: string;
        amount: number;
        price: number;
        total: number;
        timestamp: string;
    }>;
}
export declare function getWarehouseData(): WarehouseData;
export declare function saveWarehouseData(data: WarehouseData): void;
export declare function addStock(resource: string, amount: number): void;
export declare function removeStock(resource: string, amount: number): boolean;
export declare function getStock(resource: string): number;
export declare function recordTransaction(userId: string, type: "sell" | "buy", resource: string, amount: number, price: number): void;
export declare function resetHourlyStats(): void;
export declare function getPrice(resource: string, type: "buy" | "sell"): number;
export declare function getTotalValue(): number;
export declare function addTreasury(amount: number): void;
export declare function removeTreasury(amount: number): boolean;
export declare function getTreasury(): number;
export declare function getWarehouseStats(): {
    stock: Record<string, number>;
    treasury: number;
    prices: Record<string, {
        buy: number;
        sell: number;
    }>;
    statistics: {
        hourly: Record<string, WarehouseStats>;
        total: Record<string, WarehouseStats>;
        lastReset: string | null;
    };
    totalValue: number;
};
export declare function startWarehouseStatsReset(): NodeJS.Timeout;
export {};
//# sourceMappingURL=warehouseManager.d.ts.map