interface AnimalKill {
  animalName: string;
  killedBy: string;
  skinnedBy: string;
  timestamp: number;
  rewards: {
    meat?: { id: string; amount: number };
    pelt?: { id: string; amount: number };
    feather?: { id: string; amount: number };
  };
}

interface DuoHuntSession {
  sessionId: string;
  player1: { userId: string; userName: string };
  player2: { userId: string; userName: string };
  createdAt: number;
  expiresAt: number;
  startedAt?: number;
  duration: number;
  kills: AnimalKill[];
  totalKills: number;
  status: 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  lastKillTime?: number;
}

class DuoHuntSessionManager {
  private sessions: Map<string, DuoHuntSession> = new Map();
  private userToSession: Map<string, string> = new Map();
  private readonly INVITE_DURATION = 2 * 60 * 1000; // 2 minutes to accept
  private readonly HUNT_DURATION = 10 * 60 * 1000; // 10 minutes hunt

  constructor() {
    setInterval(() => this.cleanupExpiredSessions(), 60 * 1000);
  }

  createInvite(
    inviterId: string,
    inviterName: string,
    invitedId: string,
    invitedName: string,
  ): DuoHuntSession {
    const sessionId = `duo_${inviterId}_${invitedId}_${Date.now()}`;
    const now = Date.now();

    const session: DuoHuntSession = {
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

  acceptInvite(sessionId: string): DuoHuntSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (session.status !== 'WAITING') return null;

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

  getSessionByUser(userId: string): DuoHuntSession | null {
    const sessionId = this.userToSession.get(userId);
    if (!sessionId) return null;

    return this.getSession(sessionId);
  }

  getSession(sessionId: string): DuoHuntSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const now = Date.now();
    if (now > session.expiresAt) {
      this.endSession(sessionId);
      return null;
    }

    return session;
  }

  reserveKillSlot(sessionId: string): { reserved: boolean; cooldown: number } {
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

  cancelKillSlot(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastKillTime = undefined;
      this.sessions.set(sessionId, session);
    }
  }

  addKill(
    sessionId: string,
    animalName: string,
    killedBy: string,
    rewards: AnimalKill['rewards'],
  ): DuoHuntSession | null {
    const session = this.getSession(sessionId);
    if (!session || session.status !== 'ACTIVE') return null;

    const kill: AnimalKill = {
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

  addSkin(sessionId: string, killIndex: number, skinnedBy: string): DuoHuntSession | null {
    const session = this.getSession(sessionId);
    if (!session || session.status !== 'ACTIVE') return null;

    if (killIndex >= 0 && killIndex < session.kills.length) {
      session.kills[killIndex].skinnedBy = skinnedBy;
      this.sessions.set(sessionId, session);
    }

    return session;
  }

  getRemainingTime(sessionId: string): number {
    const session = this.getSession(sessionId);
    if (!session) return 0;

    const now = Date.now();
    const remaining = Math.max(0, session.expiresAt - now);
    return Math.floor(remaining / 1000);
  }

  getProgress(sessionId: string): number {
    const session = this.getSession(sessionId);
    if (!session || !session.startedAt) return 0;

    const now = Date.now();
    const elapsed = now - session.startedAt;
    const progress = (elapsed / this.HUNT_DURATION) * 100;
    return Math.min(100, Math.max(0, progress));
  }

  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.userToSession.delete(session.player1.userId);
      this.userToSession.delete(session.player2.userId);
    }
    this.sessions.delete(sessionId);
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.endSession(sessionId);
      }
    }
  }

  getSessionCount(): number {
    return this.sessions.size;
  }

  isUserInSession(userId: string): boolean {
    return this.userToSession.has(userId);
  }
}

export const duoHuntSessionManager = new DuoHuntSessionManager();
export type { DuoHuntSession, AnimalKill };
