export interface WarnData {
    userId: string;
    guildId: string;
    moderatorId: string;
    reason: string;
    timestamp: number;
    warnId: string;
}
export interface UserWarns {
    [key: string]: WarnData[];
}
export declare function addWarn(userId: string, guildId: string, moderatorId: string, reason: string): {
    success: boolean;
    warnId: string;
    totalWarns: number;
};
export declare function removeWarn(userId: string, guildId: string, warnId: string): {
    success: boolean;
    message: string;
};
export declare function clearWarns(userId: string, guildId: string): {
    success: boolean;
    clearedCount: number;
};
export declare function getUserWarns(userId: string, guildId: string): WarnData[];
export declare function getWarnCount(userId: string, guildId: string): number;
//# sourceMappingURL=warnManager.d.ts.map