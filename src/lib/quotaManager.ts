// Quota Manager - Lightweight localStorage-based quota system

interface VaultSession {
  userId: string;
  inviteCode: string;
  activatedAt: string;
  dailyQuota: {
    [date: string]: {
      [agentKey: string]: number;
    };
  };
  createdAt: string;
  lastAccessAt: string;
}

export class QuotaManager {
  private static STORAGE_KEY = 'vault_session';
  private static DAILY_LIMIT = 10;
  private static DEV_CODE = 'DEV_UNLIMITED';

  static generateUserId(): string {
    return crypto.randomUUID();
  }

  static initSession(inviteCode: string): void {
    const session: VaultSession = {
      userId: this.generateUserId(),
      inviteCode,
      activatedAt: new Date().toISOString(),
      dailyQuota: {},
      createdAt: new Date().toISOString(),
      lastAccessAt: new Date().toISOString(),
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
  }

  static getSession(): VaultSession | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  static isUnlocked(): boolean {
    return this.getSession() !== null;
  }

  private static isDeveloper(): boolean {
    const session = this.getSession();
    return session?.inviteCode === this.DEV_CODE;
  }

  private static getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  static checkQuota(agentKey: string): {
    allowed: boolean;
    remaining: number;
    used: number;
  } {
    const session = this.getSession();
    if (!session) {
      return { allowed: false, remaining: 0, used: 0 };
    }

    if (this.isDeveloper()) {
      return { allowed: true, remaining: 999, used: 0 };
    }

    const today = this.getToday();
    const used = session.dailyQuota[today]?.[agentKey] || 0;
    const remaining = this.DAILY_LIMIT - used;

    return {
      allowed: remaining > 0,
      remaining,
      used,
    };
  }

  static consumeQuota(agentKey: string): boolean {
    const session = this.getSession();
    if (!session) return false;

    if (this.isDeveloper()) {
      return true;
    }

    const today = this.getToday();

    if (!session.dailyQuota[today]) {
      session.dailyQuota[today] = {};
    }

    const used = session.dailyQuota[today][agentKey] || 0;

    if (used >= this.DAILY_LIMIT) {
      return false;
    }

    session.dailyQuota[today][agentKey] = used + 1;
    session.lastAccessAt = new Date().toISOString();

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));

    this.cleanOldData(session);

    return true;
  }

  private static cleanOldData(session: VaultSession): void {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    Object.keys(session.dailyQuota).forEach((date) => {
      const dateObj = new Date(date);
      if (dateObj < sevenDaysAgo) {
        delete session.dailyQuota[date];
      }
    });

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
  }

  static getTodayUsage(): Record<string, number> {
    const session = this.getSession();
    if (!session) return {};

    const today = this.getToday();
    return session.dailyQuota[today] || {};
  }

  static resetSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
