interface Punishment {
    reason: string;
    appliedAt: number;
    expiresAt: number;
    duration: number;
}
export declare function applyPunishment(userId: string, reason?: string): Punishment;
export declare function isPunished(userId: string): Punishment | null;
export declare function getRemainingTime(userId: string): number | null;
export declare function removePunishment(userId: string): boolean;
export declare function formatTime(ms: number): string;
export {};
//# sourceMappingURL=punishmentManager.d.ts.map