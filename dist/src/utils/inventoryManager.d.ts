interface Item {
    name: string;
    emoji: string;
    customEmoji?: string;
    weight: number;
    stackable: boolean;
    description: string;
    damage?: number;
    imageUrl?: string;
    price?: number;
    currency?: string;
    maxDurability?: number;
}
export declare const ITEMS: Record<string, Item>;
export declare const MAX_WEIGHT = 100;
interface Inventory {
    items: Record<string, number>;
    weight: number;
    maxWeight: number;
    itemDurability?: Record<string, number>;
    purchasedBackpacks?: string[];
}
export declare function getInventory(userId: string): Inventory;
export declare function saveInventory(userId: string, inventory: Inventory): void;
export declare function calculateWeight(inventory: Inventory): number;
export declare function checkCapacity(inventory: Inventory, itemId: string, quantity: number): {
    hasCapacity: boolean;
    required: number;
};
export declare function addItem(userId: string, itemId: string, quantity?: number): Promise<any>;
export declare function removeItem(userId: string, itemId: string, quantity?: number): Promise<any>;
export declare function getItem(userId: string, itemId: string): number;
export declare function transferItem(fromUserId: string, toUserId: string, itemId: string, quantity: number): Promise<any>;
export declare const UPGRADE_TIERS: ({
    level: number;
    capacity: number;
    cost: number;
    currency: null;
} | {
    level: number;
    capacity: number;
    cost: number;
    currency: string;
})[];
export declare function getBackpackLevel(userId: string): number;
export declare function getNextUpgrade(userId: string): any;
export declare function getTopUsers(itemType: string, limit?: number): Array<{
    userId: string;
    amount: number;
}>;
export declare function upgradeBackpack(userId: string, newCapacity?: number): Promise<any>;
export declare function getItemDurability(userId: string, itemId: string): number | null;
export declare function reduceDurability(userId: string, itemId: string, amount?: number): Promise<{
    success: boolean;
    durability: number;
    broken: boolean;
    item?: any;
}>;
export {};
//# sourceMappingURL=inventoryManager.d.ts.map