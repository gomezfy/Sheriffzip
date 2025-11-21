"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamCaptureManager = void 0;
class TeamCaptureManager {
    teams = new Map();
    TEAM_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes to form team
    MAX_TEAM_SIZE = 5;
    MIN_TEAM_SIZE = 2;
    /**
     * Create a new team capture session
     */
    createTeam(leader, target, bountyAmount, guildId, channelId, messageId, maxMembers = 5) {
        const teamId = `${guildId}-${leader.id}-${Date.now()}`;
        const team = {
            leaderId: leader.id,
            leaderTag: leader.tag,
            targetId: target.id,
            targetTag: target.tag,
            bountyAmount,
            members: [
                {
                    id: leader.id,
                    tag: leader.tag,
                    joinedAt: Date.now(),
                },
            ],
            guildId,
            channelId,
            messageId,
            createdAt: Date.now(),
            expiresAt: Date.now() + this.TEAM_EXPIRY_TIME,
            status: "recruiting",
            maxMembers: Math.min(maxMembers, this.MAX_TEAM_SIZE),
        };
        this.teams.set(teamId, team);
        return team;
    }
    /**
     * Add a member to a team
     */
    addMember(teamId, user) {
        const team = this.teams.get(teamId);
        if (!team) {
            return { success: false, error: "Team not found" };
        }
        if (team.status !== "recruiting") {
            return { success: false, error: "Team is no longer recruiting" };
        }
        if (Date.now() > team.expiresAt) {
            team.status = "expired";
            return { success: false, error: "Team recruitment has expired" };
        }
        if (team.members.length >= team.maxMembers) {
            return { success: false, error: "Team is full" };
        }
        if (team.members.some((m) => m.id === user.id)) {
            return { success: false, error: "User already in team" };
        }
        if (user.id === team.targetId) {
            return { success: false, error: "Target cannot join the hunting team" };
        }
        team.members.push({
            id: user.id,
            tag: user.tag,
            joinedAt: Date.now(),
        });
        team.status = team.members.length >= this.MIN_TEAM_SIZE ? "ready" : "recruiting";
        return { success: true };
    }
    /**
     * Remove a member from a team
     */
    removeMember(teamId, userId) {
        const team = this.teams.get(teamId);
        if (!team) {
            return { success: false, error: "Team not found" };
        }
        if (userId === team.leaderId) {
            // If leader leaves, disband team
            this.teams.delete(teamId);
            return { success: true };
        }
        team.members = team.members.filter((m) => m.id !== userId);
        if (team.members.length < this.MIN_TEAM_SIZE) {
            team.status = "recruiting";
        }
        return { success: true };
    }
    /**
     * Get team by ID
     */
    getTeam(teamId) {
        return this.teams.get(teamId);
    }
    /**
     * Get team by message ID
     */
    getTeamByMessage(messageId) {
        for (const [teamId, team] of this.teams.entries()) {
            if (team.messageId === messageId) {
                return { teamId, team };
            }
        }
        return undefined;
    }
    /**
     * Mark team as completed
     */
    completeTeam(teamId) {
        const team = this.teams.get(teamId);
        if (team) {
            team.status = "completed";
            // Auto-cleanup after 1 minute
            setTimeout(() => {
                this.teams.delete(teamId);
            }, 60000);
        }
    }
    /**
     * Check if user is in any active team for this target
     */
    isUserInTeamForTarget(userId, targetId) {
        for (const team of this.teams.values()) {
            if (team.targetId === targetId &&
                (team.status === "recruiting" || team.status === "ready") &&
                team.members.some((m) => m.id === userId)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Cleanup expired teams
     */
    cleanupExpiredTeams() {
        let cleaned = 0;
        const now = Date.now();
        for (const [teamId, team] of this.teams.entries()) {
            if (now > team.expiresAt && team.status === "recruiting") {
                team.status = "expired";
                this.teams.delete(teamId);
                cleaned++;
            }
        }
        return cleaned;
    }
    /**
     * Get active teams count
     */
    getActiveTeamsCount() {
        return Array.from(this.teams.values()).filter((t) => t.status === "recruiting" || t.status === "ready").length;
    }
    /**
     * Calculate reward split for team members
     */
    calculateRewardSplit(teamId) {
        const team = this.teams.get(teamId);
        if (!team)
            return undefined;
        const rewardPerMember = Math.floor(team.bountyAmount / team.members.length);
        const remainder = team.bountyAmount % team.members.length;
        const rewards = new Map();
        team.members.forEach((member, index) => {
            // Leader gets the remainder (usually just a few coins)
            const bonus = index === 0 ? remainder : 0;
            rewards.set(member.id, rewardPerMember + bonus);
        });
        return rewards;
    }
}
// Singleton instance
exports.teamCaptureManager = new TeamCaptureManager();
// Cleanup expired teams every minute
setInterval(() => {
    const cleaned = exports.teamCaptureManager.cleanupExpiredTeams();
    if (cleaned > 0) {
        console.log(`[TeamCapture] Cleaned up ${cleaned} expired teams`);
    }
}, 60000);
//# sourceMappingURL=teamCaptureManager.js.map