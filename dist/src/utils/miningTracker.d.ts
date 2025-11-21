import { Client } from "discord.js";
interface MiningSession {
    type: "solo" | "coop";
    startTime: number;
    endTime: number;
    claimed: boolean;
    goldAmount: number;
    partnerId: string | null;
    notified?: boolean;
}
/**
 * Get all active mining sessions (not claimed and not expired)
 */
export declare function getActiveSessions(): {
    userId: string;
    session: MiningSession;
}[];
/**
 * Get all completed but unclaimed mining sessions
 */
export declare function getUnclaimedSessions(): {
    userId: string;
    session: MiningSession;
}[];
/**
 * Get mining statistics
 */
export declare function getMiningStats(): {
    totalActive: number;
    soloMining: number;
    coopMining: number;
    unclaimed: number;
    totalGoldPending: number;
};
/**
 * Format time remaining
 * @param ms
 */
export declare function formatTime(ms: number): string;
/**
 * Clean up old claimed sessions (older than 24 hours)
 */
export declare function cleanupOldSessions(): number;
/**
 * Check for completed mining sessions and send DM notifications
 * @param client
 */
export declare function notifyCompletedMining(client: Client): Promise<number>;
/**
 * Start automatic mining notification system
 * Checks every 2 minutes for completed mining sessions
 * @param client
 */
export declare function startMiningNotifications(client: Client): NodeJS.Timeout;
export {};
//# sourceMappingURL=miningTracker.d.ts.map