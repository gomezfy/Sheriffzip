interface Frame {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    price: number;
    rarity: "common" | "rare" | "epic" | "legendary";
    requiresTerritory?: string;
}
interface UserFrames {
    userId: string;
    ownedFrames: string[];
    activeFrame: string | null;
}
export declare function getAllFramesTranslated(userId: string): Frame[];
export declare function getUserFrames(userId: string): UserFrames;
export declare function getAllFrames(): Frame[];
export declare function getAvailableFramesForUser(userId: string): Frame[];
export declare function getFrameById(frameId: string): Frame | null;
export declare function canUnlockFrame(userId: string, frameId: string): boolean;
export declare function userOwnsFrame(userId: string, frameId: string): boolean;
export declare function purchaseFrame(userId: string, frameId: string): boolean;
export declare function unlockFrameByTerritory(userId: string, territoryId: string): void;
export declare function setActiveFrame(userId: string, frameId: string | null): boolean;
export declare function getActiveFrameUrl(userId: string): string | null;
export declare function getRarityColor(rarity: string): string;
export declare function getRarityEmoji(rarity: string): string;
export {};
//# sourceMappingURL=frameManager.d.ts.map