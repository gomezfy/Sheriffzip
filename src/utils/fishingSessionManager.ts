interface FishingSession {
  userId: string;
  userName: string;
  fishName: string;
  fishEmoji: string;
  fishRarity: string;
  fishRarityColor: string;
  fishImageUrl: string;
  fishRewards: {
    fish: { id: string; amount: number };
  };
  fishExperience: number;
  fishDifficulty: number; // 1-5 (velocidade do movimento)
  position: number; // Posição atual da barra (0-100)
  targetZone: { min: number; max: number }; // Zona alvo (ex: 45-55)
  moveDirection: number; // -1 (esquerda) ou 1 (direita)
  moveSpeed: number; // Velocidade base do movimento
  attemptsRemaining: number;
  maxAttempts: number;
  successfulCatches: number; // Quantas vezes acertou a zona
  requiredCatches: number; // Quantas vezes precisa acertar
  createdAt: number;
  expiresAt: number;
  lastMoveTime: number;
  lastPlayerInteraction: number; // Timestamp da última interação do jogador
  isPaused: boolean; // Se o movimento automático está pausado
}

class FishingSessionManager {
  private sessions: Map<string, FishingSession> = new Map();
  private readonly SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours
  private readonly INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes of inactivity
  private readonly MAX_ATTEMPTS = 15; // 15 tentativas para acertar
  private readonly AUTO_MOVE_INTERVAL = 600; // Move a cada 600ms
  private readonly PAUSE_DURATION = 1500; // Pausa de 1.5s após interação do jogador

  constructor() {
    // Clean up expired sessions every minute
    setInterval(() => this.cleanupExpiredSessions(), 60 * 1000);
    
    // Auto-move fishing bars every 800ms
    setInterval(() => this.autoMoveAllSessions(), this.AUTO_MOVE_INTERVAL);
  }

  createSession(
    userId: string,
    userName: string,
    fish: {
      name: string;
      emoji: string;
      rarity: string;
      rarityColor: string;
      imageUrl: string;
      rewards: {
        fish: { id: string; amount: number };
      };
      experience: number;
      difficulty: number; // 1-5
      requiredCatches: number; // Quantas vezes precisa acertar (3-6)
    },
  ): FishingSession {
    const now = Date.now();
    
    // Definir zona alvo baseada na dificuldade
    const zoneSize = 15 - (fish.difficulty * 2); // Dif 1: 13, Dif 5: 5
    const zoneMid = 50;
    const targetZone = {
      min: zoneMid - Math.floor(zoneSize / 2),
      max: zoneMid + Math.floor(zoneSize / 2),
    };

    const session: FishingSession = {
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

  getSession(userId: string): FishingSession | null {
    const session = this.sessions.get(userId);
    if (!session) return null;

    // Check if expired (extend on access)
    const now = Date.now();
    if (now > session.expiresAt) {
      this.sessions.delete(userId);
      return null;
    }

    // Auto-extend session on access to prevent timeout
    session.expiresAt = now + this.SESSION_DURATION;
    this.sessions.set(userId, session);
    
    return session;
  }

  /**
   * Jogador tenta mover a barra para a esquerda
   */
  moveLeft(userId: string): FishingSession | null {
    const session = this.getSession(userId);
    if (!session) return null;

    const now = Date.now();
    session.position = Math.max(0, session.position - 10);
    session.lastPlayerInteraction = now;
    session.expiresAt = now + this.SESSION_DURATION; // Extend session on interaction
    session.isPaused = true;
    
    this.sessions.set(userId, session);
    return session;
  }

  /**
   * Jogador tenta mover a barra para a direita
   */
  moveRight(userId: string): FishingSession | null {
    const session = this.getSession(userId);
    if (!session) return null;

    const now = Date.now();
    session.position = Math.min(100, session.position + 10);
    session.lastPlayerInteraction = now;
    session.expiresAt = now + this.SESSION_DURATION; // Extend session on interaction
    session.isPaused = true;
    
    this.sessions.set(userId, session);
    return session;
  }

  /**
   * Verifica se a posição atual está na zona alvo e decrementa tentativa
   */
  checkCatch(userId: string): { success: boolean; session: FishingSession | null } {
    const session = this.getSession(userId);
    if (!session) return { success: false, session: null };

    const now = Date.now();
    
    // Decrementa tentativa ao tentar pegar
    session.attemptsRemaining--;
    session.lastPlayerInteraction = now;
    session.expiresAt = now + this.SESSION_DURATION; // Extend session on interaction

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
  hasWon(userId: string): boolean {
    const session = this.getSession(userId);
    if (!session) return false;

    return session.successfulCatches >= session.requiredCatches;
  }

  /**
   * Verifica se o jogador perdeu (sem tentativas)
   */
  hasLost(userId: string): boolean {
    const session = this.getSession(userId);
    if (!session) return false;

    return session.attemptsRemaining <= 0 && !this.hasWon(userId);
  }

  /**
   * Move automaticamente todas as sessões ativas
   */
  private autoMoveAllSessions(): void {
    const now = Date.now();
    
    for (const [userId, session] of this.sessions.entries()) {
      // Pular sessões expiradas
      if (now > session.expiresAt) continue;

      // Verificar se deve despausar após interação do jogador
      if (session.isPaused) {
        const timeSinceInteraction = now - session.lastPlayerInteraction;
        if (timeSinceInteraction >= this.PAUSE_DURATION) {
          // Tempo de pausa acabou, retomar movimento automático
          session.isPaused = false;
        } else {
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
      } else if (session.position >= 100) {
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

  endSession(userId: string): void {
    this.sessions.delete(userId);
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [userId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(userId);
      }
    }
  }

  getSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Gera a barra visual do mini-game
   */
  generateBar(userId: string): string {
    const session = this.getSession(userId);
    if (!session) return "";

    const barLength = 20;
    const position = Math.floor((session.position / 100) * barLength);
    const zoneStart = Math.floor((session.targetZone.min / 100) * barLength);
    const zoneEnd = Math.floor((session.targetZone.max / 100) * barLength);

    let bar = "";
    for (let i = 0; i < barLength; i++) {
      if (i === position) {
        bar += "🎣"; // Posição do jogador
      } else if (i >= zoneStart && i <= zoneEnd) {
        bar += "🟢"; // Zona alvo
      } else {
        bar += "⬜"; // Espaço vazio
      }
    }

    return bar;
  }
}

export const fishingSessionManager = new FishingSessionManager();
export type { FishingSession };
