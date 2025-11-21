export interface Background {
    id: string;
    name: string;
    filename: string;
    price: number;
    description: string;
    rarity: "common" | "rare" | "epic" | "legendary" | "mythic";
    free: boolean;
    imageUrl?: string;
}
/**
 * All available backgrounds
 */
export declare const BACKGROUNDS: Background[];
/**
 * Get background by ID
 * @param id
 */
export declare function getBackgroundById(id: string): Background | null;
/**
 * Get all backgrounds
 */
export declare function getAllBackgrounds(): Background[];
/**
 * Get backgrounds by rarity
 * @param rarity
 */
export declare function getBackgroundsByRarity(rarity: string): Background[];
/**
 * Check if user owns a background
 * @param userId
 * @param backgroundId
 */
export declare function userOwnsBackground(userId: string, backgroundId: string): boolean;
/**
 * Get all backgrounds owned by user
 * @param userId
 */
export declare function getUserBackgrounds(userId: string): Background[];
/**
 * Purchase a background for a user
 * @param userId
 * @param backgroundId
 */
export declare function purchaseBackground(userId: string, backgroundId: string): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Set active background for user
 * @param userId
 * @param backgroundId
 */
export declare function setUserBackground(userId: string, backgroundId: string): {
    success: boolean;
    message: string;
};
/**
 * Get user's current active background
 * @param userId
 */
export declare function getUserCurrentBackground(userId: string): Background | null;
/**
 * Get rarity color
 * @param rarity
 */
export declare function getRarityColor(rarity: string): number;
/**
 * Get rarity emoji
 * @param rarity
 */
export declare function getRarityEmoji(rarity: string): string;
/**
 * Check if background file exists
 * @param filename
 */
export declare function backgroundFileExists(filename: string): boolean;
//# sourceMappingURL=backgroundManager.d.ts.map