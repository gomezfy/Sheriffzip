export interface HuntResult {
    success: boolean;
    animal?: {
        name: string;
        emoji: string;
        rarity: string;
        rarityColor: string;
    };
    rewards?: {
        meat: {
            id: string;
            name: string;
            amount: number;
        };
        pelt?: {
            id: string;
            name: string;
            amount: number;
        };
        feather?: {
            id: string;
            name: string;
            amount: number;
        };
    };
    experience: number;
    shotAccuracy: number;
    attemptsRemaining?: number;
    maxAttempts?: number;
}
export declare function createHuntingCanvas(result: HuntResult, userName: string): Promise<Buffer>;
export declare function createHuntingStartCanvas(animalName: string, animalEmoji: string, animalRarity: string, animalRarityColor: string, userName: string, attemptsRemaining: number, maxAttempts: number): Promise<Buffer>;
//# sourceMappingURL=huntingCanvas.d.ts.map