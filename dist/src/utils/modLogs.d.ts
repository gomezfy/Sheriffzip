import { User, GuildMember, Message, Guild } from "discord.js";
export interface ModLogConfig {
    [guildId: string]: {
        channelId: string;
        events: {
            messageDelete: boolean;
            messageEdit: boolean;
            memberJoin: boolean;
            memberLeave: boolean;
            memberBan: boolean;
            memberUnban: boolean;
            memberKick: boolean;
            roleUpdate: boolean;
            channelUpdate: boolean;
            warnAdd: boolean;
            muteAdd: boolean;
        };
    };
}
export declare function setModLogChannel(guildId: string, channelId: string): {
    success: boolean;
    message: string;
};
export declare function getModLogChannel(guildId: string): string | null;
export declare function isEventEnabled(guildId: string, event: string): boolean;
export declare function logMessageDelete(message: Message): Promise<void>;
export declare function logMessageEdit(oldMessage: Message, newMessage: Message): Promise<void>;
export declare function logMemberJoin(member: GuildMember): Promise<void>;
export declare function logMemberLeave(member: GuildMember): Promise<void>;
export declare function logMemberBan(guild: Guild, user: User, reason?: string): Promise<void>;
export declare function logWarn(guild: Guild, user: User, moderator: User, reason: string, warnCount: number): Promise<void>;
export declare function logMute(guild: Guild, user: User, moderator: User, reason: string, duration: number): Promise<void>;
//# sourceMappingURL=modLogs.d.ts.map