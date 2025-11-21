interface AnimalKill {
    animalName: string;
    killedBy: string;
    skinnedBy: string;
    timestamp: number;
    rewards: {
        meat?: {
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
}
interface DuoHuntSession {
    sessionId: string;
    player1: {
        userId: string;
        userName: string;
    };
    player2: {
        userId: string;
        userName: string;
    };
    createdAt: number;
    expiresAt: number;
    startedAt?: number;
    duration: number;
    kills: AnimalKill[];
    totalKills: number;
    status: 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
    lastKillTime?: number;
}
declare class DuoHuntSessionManager {
    private sessions;
    private userToSession;
    private readonly INVITE_DURATION;
    private readonly HUNT_DURATION;
    constructor();
    createInvite(inviterId: string, inviterName: string, invitedId: string, invitedName: string): DuoHuntSession;
    acceptInvite(sessionId: string): DuoHuntSession | null;
    getSessionByUser(userId: string): DuoHuntSession | null;
    getSession(sessionId: string): DuoHuntSession | null;
    reserveKillSlot(sessionId: string): {
        reserved: boolean;
        cooldown: number;
    };
    cancelKillSlot(sessionId: string): void;
    addKill(sessionId: string, animalName: string, killedBy: string, rewards: AnimalKill['rewards']): DuoHuntSession | null;
    addSkin(sessionId: string, killIndex: number, skinnedBy: string): DuoHuntSession | null;
    getRemainingTime(sessionId: string): number;
    getProgress(sessionId: string): number;
    endSession(sessionId: string): void;
    private cleanupExpiredSessions;
    getSessionCount(): number;
    isUserInSession(userId: string): boolean;
}
export declare const duoHuntSessionManager: DuoHuntSessionManager;
export type { DuoHuntSession, AnimalKill };
//# sourceMappingURL=duoHuntSessionManager.d.ts.map