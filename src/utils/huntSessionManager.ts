interface HuntSession {
  userId: string;
  userName: string;
  animalName: string;
  animalEmoji: string;
  animalRarity: string;
  animalRarityColor: string;
  animalRequiredAccuracy: number;
  animalImageUrl: string;
  animalRewards: {
    meat: { id: string; amount: number };
    pelt?: { id: string; amount: number };
    feather?: { id: string; amount: number };
  };
  animalExperience: number;
  attemptsRemaining: number;
  maxAttempts: number;
  bestAccuracy: number;
  shotHistory: number[];
  createdAt: number;
  expiresAt: number;
}

class HuntSessionManager {
  private sessions: Map<string, HuntSession> = new Map();
  private readonly SESSION_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_ATTEMPTS = 5;

  constructor() {
    // Clean up expired sessions every minute
    setInterval(() => this.cleanupExpiredSessions(), 60 * 1000);
  }

  createSession(
    userId: string,
    userName: string,
    animal: {
      name: string;
      emoji: string;
      rarity: string;
      rarityColor: string;
      requiredAccuracy: number;
      imageUrl: string;
      rewards: {
        meat: { id: string; amount: number };
        pelt?: { id: string; amount: number };
        feather?: { id: string; amount: number };
      };
      experience: number;
    },
  ): HuntSession {
    const now = Date.now();
    const session: HuntSession = {
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

  getSession(userId: string): HuntSession | null {
    const session = this.sessions.get(userId);
    if (!session) return null;

    // Check if expired
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(userId);
      return null;
    }

    return session;
  }

  recordShot(userId: string, accuracy: number): HuntSession | null {
    const session = this.getSession(userId);
    if (!session) return null;

    session.attemptsRemaining--;
    session.shotHistory.push(accuracy);
    if (accuracy > session.bestAccuracy) {
      session.bestAccuracy = accuracy;
    }

    this.sessions.set(userId, session);
    return session;
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
}

export const huntSessionManager = new HuntSessionManager();
export type { HuntSession };
