export interface GeneralStoreItem {
    id: string;
    name: string;
    description: string;
    price: number;
    currency?: 'tokens' | 'silver';
    emoji: string;
    imageFile?: string;
    category: 'tools' | 'consumables' | 'backpacks';
    backpackCapacity?: number;
}
export interface GeneralStoreItemImage {
    file?: string;
    url?: string;
}
export declare const GENERAL_STORE_ITEMS: GeneralStoreItem[];
export declare function getAllStoreItems(): GeneralStoreItem[];
export declare function getStoreItemsByCategory(category: GeneralStoreItem['category'] | 'all'): GeneralStoreItem[];
export declare function getStoreItemById(itemId: string): GeneralStoreItem | null;
export declare function getCategoryName(category: string): string;
export declare function getItemImagePath(imageFile: string): string;
export declare function getCategoryEmoji(category: GeneralStoreItem['category']): string;
//# sourceMappingURL=generalStoreManager.d.ts.map