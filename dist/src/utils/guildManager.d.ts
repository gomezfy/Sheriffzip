import { PlayerGuild, GuildOperationResult, JoinRequest } from "../types";
export declare function createGuild(userId: string, name: string, description: string, isPublic?: boolean): Promise<GuildOperationResult>;
export declare function getUserGuild(userId: string): PlayerGuild | null;
export declare function getGuildById(guildId: string): PlayerGuild | null;
export declare function getAllGuilds(): PlayerGuild[];
export declare function getPublicGuilds(): PlayerGuild[];
export declare function joinGuild(userId: string, guildId: string): GuildOperationResult;
export declare function leaveGuild(userId: string): GuildOperationResult;
export declare function isUserInGuild(userId: string): boolean;
export declare function getGuildMemberCount(guildId: string): number;
export declare function createJoinRequest(userId: string, guildId: string): {
    success: boolean;
    message: string;
    requestId?: string;
};
export declare function approveJoinRequest(requestId: string): GuildOperationResult;
export declare function rejectJoinRequest(requestId: string): {
    success: boolean;
    message: string;
    userId?: string;
    guildName?: string;
};
export declare function getPendingRequestsForGuild(guildId: string): JoinRequest[];
export declare function getRequestById(requestId: string): JoinRequest | null;
export declare function deleteJoinRequest(requestId: string): boolean;
export declare function kickMember(kickerId: string, targetId: string): GuildOperationResult;
export declare function promoteMember(leaderId: string, targetId: string): GuildOperationResult;
export declare function demoteMember(leaderId: string, targetId: string): GuildOperationResult;
export declare function getGuildLeaderboard(limit?: number): Array<{
    guildId: string;
    guild: PlayerGuild;
    score: number;
}>;
//# sourceMappingURL=guildManager.d.ts.map