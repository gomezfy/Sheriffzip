"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fishingSessionManager = void 0;
class FishingSessionManager {
    sessions = new Map();
    SESSION_DURATION = 10 * 60 * 1000; // 10 minutes
    MAX_ATTEMPTS = 15; // 15 tentativas para acertar
    AUTO_MOVE_INTERVAL = 800; // Move a cada 800ms
    PAUSE_DURATION = 2500; // Pausa de 2.5s após interação do jogador
    constructor() {
        // Clean up expired sessions every minute
        setInterval(() => this.cleanupExpiredSessions(), 60 * 1000);
        // Auto-move fishing bars every 800ms
        setInterval(() => this.autoMoveAllSessions(), this.AUTO_MOVE_INTERVAL);
    }
    createSession(userId, userName, fish) {
        const now = Date.now();
        // Definir zona alvo baseada na dificuldade
        const zoneSize = 15 - (fish.difficulty * 2); // Dif 1: 13, Dif 5: 5
        const zoneMid = 50;
        const targetZone = {
            min: zoneMid - Math.floor(zoneSize / 2),
            max: zoneMid + Math.floor(zoneSize / 2),
        };
        const session = {
            userId,
            userName,
            fishName: fish.name,
            fishEmoji: fish.emoji,
            fishRarity: fish.rarity,
            fishRarityColor: fish.rarityColor,
            fishImageUrl: fish.imageUrl,
            fishRewards: fish.rewards,
            fishExperience: fish.experience,
            fishDifficulty: fish.difficulty,
            position: 50, // Começa no meio
            targetZone,
            moveDirection: Math.random() > 0.5 ? 1 : -1, // Direção aleatória
            moveSpeed: 3 + fish.difficulty, // Velocidade aumenta com dificuldade
            attemptsRemaining: this.MAX_ATTEMPTS,
            maxAttempts: this.MAX_ATTEMPTS,
            successfulCatches: 0,
            requiredCatches: fish.requiredCatches,
            createdAt: now,
            expiresAt: now + this.SESSION_DURATION,
            lastMoveTime: now,
            lastPlayerInteraction: now,
            isPaused: false,
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
    /**
     * Jogador tenta mover a barra para a esquerda
     */
    moveLeft(userId) {
        const session = this.getSession(userId);
        if (!session)
            return null;
        session.position = Math.max(0, session.position - 10);
        session.lastPlayerInteraction = Date.now();
        session.isPaused = true;
        this.sessions.set(userId, session);
        return session;
    }
    /**
     * Jogador tenta mover a barra para a direita
     */
    moveRight(userId) {
        const session = this.getSession(userId);
        if (!session)
            return null;
        session.position = Math.min(100, session.position + 10);
        session.lastPlayerInteraction = Date.now();
        session.isPaused = true;
        this.sessions.set(userId, session);
        return session;
    }
    /**
     * Verifica se a posição atual está na zona alvo e decrementa tentativa
     */
    checkCatch(userId) {
        const session = this.getSession(userId);
        if (!session)
            return { success: false, session: null };
        // Decrementa tentativa ao tentar pegar
        session.attemptsRemaining--;
        const inZone = session.position >= session.targetZone.min &&
            session.position <= session.targetZone.max;
        if (inZone) {
            session.successfulCatches++;
            // Resetar posição e gerar nova zona alvo para próximo acerto
            session.position = 50; // Volta para o meio
            const zoneSize = 15 - (session.fishDifficulty * 2);
            const zoneMid = 50;
            session.targetZone = {
                min: zoneMid - Math.floor(zoneSize / 2),
                max: zoneMid + Math.floor(zoneSize / 2),
            };
        }
        this.sessions.set(userId, session);
        return { success: inZone, session };
    }
    /**
     * Verifica se o jogador venceu (pegou o peixe)
     */
    hasWon(userId) {
        const session = this.getSession(userId);
        if (!session)
            return false;
        return session.successfulCatches >= session.requiredCatches;
    }
    /**
     * Verifica se o jogador perdeu (sem tentativas)
     */
    hasLost(userId) {
        const session = this.getSession(userId);
        if (!session)
            return false;
        return session.attemptsRemaining <= 0 && !this.hasWon(userId);
    }
    /**
     * Move automaticamente todas as sessões ativas
     */
    autoMoveAllSessions() {
        const now = Date.now();
        for (const [userId, session] of this.sessions.entries()) {
            // Pular sessões expiradas
            if (now > session.expiresAt)
                continue;
            // Verificar se deve despausar após interação do jogador
            if (session.isPaused) {
                const timeSinceInteraction = now - session.lastPlayerInteraction;
                if (timeSinceInteraction >= this.PAUSE_DURATION) {
                    // Tempo de pausa acabou, retomar movimento automático
                    session.isPaused = false;
                }
                else {
                    // Ainda pausado, não mover
                    continue;
                }
            }
            // Move a posição baseado na direção e velocidade
            session.position += session.moveDirection * session.moveSpeed;
            // Inverte direção se bater nas bordas
            if (session.position <= 0) {
                session.position = 0;
                session.moveDirection = 1;
            }
            else if (session.position >= 100) {
                session.position = 100;
                session.moveDirection = -1;
            }
            // Chance aleatória de mudar direção (mais difícil = mais mudanças)
            if (Math.random() < session.fishDifficulty * 0.05) {
                session.moveDirection *= -1;
            }
            session.lastMoveTime = now;
            this.sessions.set(userId, session);
        }
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
    /**
     * Gera a barra visual do mini-game
     */
    generateBar(userId) {
        const session = this.getSession(userId);
        if (!session)
            return "";
        const barLength = 20;
        const position = Math.floor((session.position / 100) * barLength);
        const zoneStart = Math.floor((session.targetZone.min / 100) * barLength);
        const zoneEnd = Math.floor((session.targetZone.max / 100) * barLength);
        let bar = "";
        for (let i = 0; i < barLength; i++) {
            if (i === position) {
                bar += "🎣"; // Posição do jogador
            }
            else if (i >= zoneStart && i <= zoneEnd) {
                bar += "🟢"; // Zona alvo
            }
            else {
                bar += "⬜"; // Espaço vazio
            }
        }
        return bar;
    }
}
exports.fishingSessionManager = new FishingSessionManager();
//# sourceMappingURL=fishingSessionManager.js.map