export interface Territory {
    id: string;
    name: string;
    description: string;
    price: number;
    emoji: string;
    benefits: string[];
    image?: string;
    rarity: "common" | "rare" | "epic" | "legendary";
    color: number;
}
export interface TerritoryOwnership {
    [userId: string]: {
        territories: string[];
        purchaseHistory: {
            territoryId: string;
            purchaseDate: number;
            pricePaid: number;
        }[];
    };
}
export declare const TERRITORIES: Territory[];
/**
 * Get territory data by ID
 * @param territoryId
 */
export declare function getTerritory(territoryId: string): Territory | undefined;
/**
 * Get all territories owned by a user
 * @param userId
 */
export declare function getUserTerritories(userId: string): string[];
/**
 * Check if user owns a specific territory
 * @param userId
 * @param territoryId
 */
export declare function ownsTerritory(userId: string, territoryId: string): boolean;
/**
 * Purchase a territory for a user
 * @param userId
 * @param territoryId
 * @param pricePaid
 */
export declare function purchaseTerritory(userId: string, territoryId: string, pricePaid: number): boolean;
/**
 * Get user's purchase history
 * @param userId
 */
export declare function getPurchaseHistory(userId: string): {
    territoryId: string;
    purchaseDate: number;
    pricePaid: number;
}[];
/**
 * Get total territories owned by user
 * @param userId
 */
export declare function getTerritoryCount(userId: string): number;
/**
 * Get all users who own territories (for stats)
 */
export declare function getAllTerritoryOwners(): {
    userId: string;
    count: number;
}[];
//# sourceMappingURL=territoryManager.d.ts.map