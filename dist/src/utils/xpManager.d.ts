interface UserXP {
    xp: number;
    level: number;
    lastMessageTimestamp: number;
}
export declare function getXpForLevel(level: number): number;
export declare function getUserXp(userId: string): UserXP;
export declare function addXp(userId: string, amount: number, bypassCooldown?: boolean): {
    leveledUp: boolean;
    oldLevel: number;
    newLevel: number;
    granted: boolean;
};
export declare function getXpLeaderboard(limit?: number): {
    userId: string;
    xp: number;
    level: number;
}[];
export {};
//# sourceMappingURL=xpManager.d.ts.map