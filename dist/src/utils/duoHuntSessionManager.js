"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.duoHuntSessionManager = void 0;
class DuoHuntSessionManager {
    sessions = new Map();
    userToSession = new Map();
    INVITE_DURATION = 2 * 60 * 1000; // 2 minutes to accept
    HUNT_DURATION = 10 * 60 * 1000; // 10 minutes hunt
    constructor() {
        setInterval(() => this.cleanupExpiredSessions(), 60 * 1000);
    }
    createInvite(inviterId, inviterName, invitedId, invitedName) {
        const sessionId = `duo_${inviterId}_${invitedId}_${Date.now()}`;
        const now = Date.now();
        const session = {
            sessionId,
            player1: { userId: inviterId, userName: inviterName },
            player2: { userId: invitedId, userName: invitedName },
            createdAt: now,
            expiresAt: now + this.INVITE_DURATION,
            duration: this.HUNT_DURATION,
            kills: [],
            totalKills: 0,
            status: 'WAITING',
        };
        this.sessions.set(sessionId, session);
        this.userToSession.set(inviterId, sessionId);
        this.userToSession.set(invitedId, sessionId);
        return session;
    }
    acceptInvite(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return null;
        if (session.status !== 'WAITING')
            return null;
        const now = Date.now();
        if (now > session.expiresAt) {
            this.endSession(sessionId);
            return null;
        }
        session.status = 'ACTIVE';
        session.startedAt = now;
        session.expiresAt = now + this.HUNT_DURATION;
        this.sessions.set(sessionId, session);
        return session;
    }
    getSessionByUser(userId) {
        const sessionId = this.userToSession.get(userId);
        if (!sessionId)
            return null;
        return this.getSession(sessionId);
    }
    getSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return null;
        const now = Date.now();
        if (now > session.expiresAt) {
            this.endSession(sessionId);
            return null;
        }
        return session;
    }
    reserveKillSlot(sessionId) {
        const session = this.getSession(sessionId);
        if (!session || session.status !== 'ACTIVE') {
            return { reserved: false, cooldown: 0 };
        }
        const now = Date.now();
        if (session.lastKillTime) {
            const timeSinceLastKill = now - session.lastKillTime;
            const cooldownRemaining = Math.max(0, 10000 - timeSinceLastKill);
            if (cooldownRemaining > 0) {
                return { reserved: false, cooldown: Math.ceil(cooldownRemaining / 1000) };
            }
        }
        session.lastKillTime = now;
        this.sessions.set(sessionId, session);
        return { reserved: true, cooldown: 0 };
    }
    cancelKillSlot(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.lastKillTime = undefined;
            this.sessions.set(sessionId, session);
        }
    }
    addKill(sessionId, animalName, killedBy, rewards) {
        const session = this.getSession(sessionId);
        if (!session || session.status !== 'ACTIVE')
            return null;
        const kill = {
            animalName,
            killedBy,
            skinnedBy: '',
            timestamp: Date.now(),
            rewards,
        };
        session.kills.push(kill);
        session.totalKills++;
        this.sessions.set(sessionId, session);
        return session;
    }
    addSkin(sessionId, killIndex, skinnedBy) {
        const session = this.getSession(sessionId);
        if (!session || session.status !== 'ACTIVE')
            return null;
        if (killIndex >= 0 && killIndex < session.kills.length) {
            session.kills[killIndex].skinnedBy = skinnedBy;
            this.sessions.set(sessionId, session);
        }
        return session;
    }
    getRemainingTime(sessionId) {
        const session = this.getSession(sessionId);
        if (!session)
            return 0;
        const now = Date.now();
        const remaining = Math.max(0, session.expiresAt - now);
        return Math.floor(remaining / 1000);
    }
    getProgress(sessionId) {
        const session = this.getSession(sessionId);
        if (!session || !session.startedAt)
            return 0;
        const now = Date.now();
        const elapsed = now - session.startedAt;
        const progress = (elapsed / this.HUNT_DURATION) * 100;
        return Math.min(100, Math.max(0, progress));
    }
    endSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            this.userToSession.delete(session.player1.userId);
            this.userToSession.delete(session.player2.userId);
        }
        this.sessions.delete(sessionId);
    }
    cleanupExpiredSessions() {
        const now = Date.now();
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now > session.expiresAt) {
                this.endSession(sessionId);
            }
        }
    }
    getSessionCount() {
        return this.sessions.size;
    }
    isUserInSession(userId) {
        return this.userToSession.has(userId);
    }
}
exports.duoHuntSessionManager = new DuoHuntSessionManager();
//# sourceMappingURL=duoHuntSessionManager.js.map