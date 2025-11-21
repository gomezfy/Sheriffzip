interface FishingSession {
    userId: string;
    userName: string;
    fishName: string;
    fishEmoji: string;
    fishRarity: string;
    fishRarityColor: string;
    fishImageUrl: string;
    fishRewards: {
        fish: {
            id: string;
            amount: number;
        };
    };
    fishExperience: number;
    fishDifficulty: number;
    position: number;
    targetZone: {
        min: number;
        max: number;
    };
    moveDirection: number;
    moveSpeed: number;
    attemptsRemaining: number;
    maxAttempts: number;
    successfulCatches: number;
    requiredCatches: number;
    createdAt: number;
    expiresAt: number;
    lastMoveTime: number;
    lastPlayerInteraction: number;
    isPaused: boolean;
}
declare class FishingSessionManager {
    private sessions;
    private readonly SESSION_DURATION;
    private readonly INACTIVITY_TIMEOUT;
    private readonly MAX_ATTEMPTS;
    private readonly AUTO_MOVE_INTERVAL;
    private readonly PAUSE_DURATION;
    constructor();
    createSession(userId: string, userName: string, fish: {
        name: string;
        emoji: string;
        rarity: string;
        rarityColor: string;
        imageUrl: string;
        rewards: {
            fish: {
                id: string;
                amount: number;
            };
        };
        experience: number;
        difficulty: number;
        requiredCatches: number;
    }): FishingSession;
    getSession(userId: string): FishingSession | null;
    /**
     * Jogador tenta mover a barra para a esquerda
     */
    moveLeft(userId: string): FishingSession | null;
    /**
     * Jogador tenta mover a barra para a direita
     */
    moveRight(userId: string): FishingSession | null;
    /**
     * Verifica se a posição atual está na zona alvo e decrementa tentativa
     */
    checkCatch(userId: string): {
        success: boolean;
        session: FishingSession | null;
    };
    /**
     * Verifica se o jogador venceu (pegou o peixe)
     */
    hasWon(userId: string): boolean;
    /**
     * Verifica se o jogador perdeu (sem tentativas)
     */
    hasLost(userId: string): boolean;
    /**
     * Move automaticamente todas as sessões ativas
     */
    private autoMoveAllSessions;
    endSession(userId: string): void;
    private cleanupExpiredSessions;
    getSessionCount(): number;
    /**
     * Gera a barra visual do mini-game
     */
    generateBar(userId: string): string;
}
export declare const fishingSessionManager: FishingSessionManager;
export type { FishingSession };
//# sourceMappingURL=fishingSessionManager.d.ts.map