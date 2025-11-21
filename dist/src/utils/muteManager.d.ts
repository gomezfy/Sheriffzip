import { GuildMember } from "discord.js";
export interface MuteData {
    userId: string;
    guildId: string;
    moderatorId: string;
    reason: string;
    mutedAt: number;
    expiresAt: number;
    muteId: string;
}
export interface ActiveMutes {
    [key: string]: MuteData;
}
export declare function muteUser(member: GuildMember, moderatorId: string, reason: string, durationMinutes: number): Promise<{
    success: boolean;
    message: string;
    expiresAt?: number;
}>;
export declare function unmuteUser(member: GuildMember): Promise<{
    success: boolean;
    message: string;
}>;
export declare function checkExpiredMutes(): string[];
export declare function getActiveMute(userId: string, guildId: string): MuteData | null;
//# sourceMappingURL=muteManager.d.ts.map