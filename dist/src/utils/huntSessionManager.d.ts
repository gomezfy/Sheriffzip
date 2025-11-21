interface HuntSession {
    userId: string;
    userName: string;
    animalName: string;
    animalEmoji: string;
    animalRarity: string;
    animalRarityColor: string;
    animalRequiredAccuracy: number;
    animalImageUrl: string;
    animalRewards: {
        meat: {
            id: string;
            amount: number;
        };
        pelt?: {
            id: string;
            amount: number;
        };
        feather?: {
            id: string;
            amount: number;
        };
    };
    animalExperience: number;
    attemptsRemaining: number;
    maxAttempts: number;
    bestAccuracy: number;
    shotHistory: number[];
    createdAt: number;
    expiresAt: number;
}
declare class HuntSessionManager {
    private sessions;
    private readonly SESSION_DURATION;
    private readonly MAX_ATTEMPTS;
    constructor();
    createSession(userId: string, userName: string, animal: {
        name: string;
        emoji: string;
        rarity: string;
        rarityColor: string;
        requiredAccuracy: number;
        imageUrl: string;
        rewards: {
            meat: {
                id: string;
                amount: number;
            };
            pelt?: {
                id: string;
                amount: number;
            };
            feather?: {
                id: string;
                amount: number;
            };
        };
        experience: number;
    }): HuntSession;
    getSession(userId: string): HuntSession | null;
    recordShot(userId: string, accuracy: number): HuntSession | null;
    endSession(userId: string): void;
    private cleanupExpiredSessions;
    getSessionCount(): number;
}
export declare const huntSessionManager: HuntSessionManager;
export type { HuntSession };
//# sourceMappingURL=huntSessionManager.d.ts.map