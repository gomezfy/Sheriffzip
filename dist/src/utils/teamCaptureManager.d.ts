import { User } from "discord.js";
export interface TeamCapture {
    leaderId: string;
    leaderTag: string;
    targetId: string;
    targetTag: string;
    bountyAmount: number;
    members: Array<{
        id: string;
        tag: string;
        joinedAt: number;
    }>;
    guildId: string;
    channelId: string;
    messageId: string;
    createdAt: number;
    expiresAt: number;
    status: "recruiting" | "ready" | "completed" | "expired";
    maxMembers: number;
}
declare class TeamCaptureManager {
    private teams;
    private readonly TEAM_EXPIRY_TIME;
    private readonly MAX_TEAM_SIZE;
    private readonly MIN_TEAM_SIZE;
    /**
     * Create a new team capture session
     */
    createTeam(leader: User, target: User, bountyAmount: number, guildId: string, channelId: string, messageId: string, maxMembers?: number): TeamCapture;
    /**
     * Add a member to a team
     */
    addMember(teamId: string, user: User): {
        success: boolean;
        error?: string;
    };
    /**
     * Remove a member from a team
     */
    removeMember(teamId: string, userId: string): {
        success: boolean;
        error?: string;
    };
    /**
     * Get team by ID
     */
    getTeam(teamId: string): TeamCapture | undefined;
    /**
     * Get team by message ID
     */
    getTeamByMessage(messageId: string): {
        teamId: string;
        team: TeamCapture;
    } | undefined;
    /**
     * Mark team as completed
     */
    completeTeam(teamId: string): void;
    /**
     * Check if user is in any active team for this target
     */
    isUserInTeamForTarget(userId: string, targetId: string): boolean;
    /**
     * Cleanup expired teams
     */
    cleanupExpiredTeams(): number;
    /**
     * Get active teams count
     */
    getActiveTeamsCount(): number;
    /**
     * Calculate reward split for team members
     */
    calculateRewardSplit(teamId: string): Map<string, number> | undefined;
}
export declare const teamCaptureManager: TeamCaptureManager;
export {};
//# sourceMappingURL=teamCaptureManager.d.ts.map