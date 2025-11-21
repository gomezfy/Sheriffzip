"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.huntSessionManager = void 0;
class HuntSessionManager {
    sessions = new Map();
    SESSION_DURATION = 5 * 60 * 1000; // 5 minutes
    MAX_ATTEMPTS = 5;
    constructor() {
        // Clean up expired sessions every minute
        setInterval(() => this.cleanupExpiredSessions(), 60 * 1000);
    }
    createSession(userId, userName, animal) {
        const now = Date.now();
        const session = {
            userId,
            userName,
            animalName: animal.name,
            animalEmoji: animal.emoji,
            animalRarity: animal.rarity,
            animalRarityColor: animal.rarityColor,
            animalRequiredAccuracy: animal.requiredAccuracy,
            animalImageUrl: animal.imageUrl,
            animalRewards: animal.rewards,
            animalExperience: animal.experience,
            attemptsRemaining: this.MAX_ATTEMPTS,
            maxAttempts: this.MAX_ATTEMPTS,
            bestAccuracy: 0,
            shotHistory: [],
            createdAt: now,
            expiresAt: now + this.SESSION_DURATION,
        };
        this.sessions.set(userId, session);
        return session;
    }
    getSession(userId) {
        const session = this.sessions.get(userId);
        if (!session)
            return null;
        // Check if expired
        if (Date.now() > session.expiresAt) {
            this.sessions.delete(userId);
            return null;
        }
        return session;
    }
    recordShot(userId, accuracy) {
        const session = this.getSession(userId);
        if (!session)
            return null;
        session.attemptsRemaining--;
        session.shotHistory.push(accuracy);
        if (accuracy > session.bestAccuracy) {
            session.bestAccuracy = accuracy;
        }
        this.sessions.set(userId, session);
        return session;
    }
    endSession(userId) {
        this.sessions.delete(userId);
    }
    cleanupExpiredSessions() {
        const now = Date.now();
        for (const [userId, session] of this.sessions.entries()) {
            if (now > session.expiresAt) {
                this.sessions.delete(userId);
            }
        }
    }
    getSessionCount() {
        return this.sessions.size;
    }
}
exports.huntSessionManager = new HuntSessionManager();
//# sourceMappingURL=huntSessionManager.js.map