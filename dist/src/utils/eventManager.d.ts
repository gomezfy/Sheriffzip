import { Client } from "discord.js";
export interface EventParticipant {
    userId: string;
    username: string;
    goldMined: number;
    points: number;
    avatarHash?: string;
}
export interface HuntingEventParticipant {
    userId: string;
    username: string;
    animalsKilled: number;
    peltsCollected: number;
    meatCollected: number;
    points: number;
    avatarHash?: string;
    kills: {
        [animalName: string]: number;
    };
}
export interface MiningEvent {
    id: string;
    name: string;
    type: "mining";
    startTime: number;
    endTime: number;
    active: boolean;
    phase: number;
    participants: {
        [userId: string]: EventParticipant;
    };
    winners?: EventWinner[];
    notificationChannelId?: string;
    payoutStatus?: "pending" | "in_progress" | "completed" | "failed_retry";
    rewardsPaid?: string[];
}
export interface HuntingEvent {
    id: string;
    name: string;
    type: "hunting";
    startTime: number;
    endTime: number;
    active: boolean;
    phase: number;
    participants: {
        [userId: string]: HuntingEventParticipant;
    };
    winners?: HuntingEventWinner[];
    notificationChannelId?: string;
    payoutStatus?: "pending" | "in_progress" | "completed" | "failed_retry";
    rewardsPaid?: string[];
}
export type GameEvent = MiningEvent | HuntingEvent;
export interface EventWinner {
    position: number;
    userId: string;
    username: string;
    goldMined: number;
    points: number;
    rewards: {
        silver: number;
        tokens: number;
        xp: number;
    };
}
export interface HuntingEventWinner {
    position: number;
    userId: string;
    username: string;
    animalsKilled: number;
    peltsCollected: number;
    meatCollected: number;
    points: number;
    rewards: {
        silver: number;
        tokens: number;
        xp: number;
    };
}
export interface EventsData {
    currentEvent: MiningEvent | null;
    activeEvents: GameEvent[];
    history: GameEvent[];
    huntingEvents?: HuntingEvent[];
}
/**
 * Get events data
 */
export declare function getEventsData(): EventsData;
/**
 * Save events data
 */
export declare function saveEventsData(data: EventsData): void;
/**
 * Start a new mining event (48h duration, starts at 00:00 Sunday, ends Tuesday 00:00)
 */
export declare function startMiningEvent(client?: Client, notificationChannelId?: string, eventName?: string): Promise<MiningEvent>;
/**
 * Add gold mined to user's event participation
 * 1 ouro = 40 pontos
 */
export declare function addEventGold(userId: string, username: string, goldAmount: number): boolean;
/**
 * Get current event
 */
export declare function getCurrentEvent(): MiningEvent | null;
/**
 * Get all active events
 */
export declare function getAllActiveEvents(): GameEvent[];
/**
 * Get event by ID
 */
export declare function getEventById(eventId: string): GameEvent | null;
/**
 * Get event leaderboard (sorted by points)
 */
export declare function getEventLeaderboard(): EventParticipant[];
/**
 * Update event phase based on elapsed time
 * 7 phases (0-6): each phase represents ~14.3% of the total event duration
 */
export declare function updateEventPhase(): void;
/**
 * Send DM notification when event starts
 */
export declare function sendEventStartNotification(client: Client, event: MiningEvent): Promise<void>;
/**
 * Check if event should end and handle rewards
 */
export declare function checkAndEndEvent(client?: Client): Promise<boolean>;
/**
 * Get time until next event (next Sunday at 00:00)
 * If it's currently Sunday and before the 24h window closes, returns time to next week
 * If it's currently Sunday and no active event exists, should trigger immediate start
 */
export declare function getTimeUntilNextEvent(): number;
/**
 * Get next Sunday date formatted
 */
export declare function getNextSundayDate(): Date;
/**
 * Format time remaining
 */
export declare function formatTimeRemaining(ms: number): string;
/**
 * Is it Sunday?
 */
export declare function isSunday(): boolean;
/**
 * Start a new hunting event
 */
export declare function startHuntingEvent(client?: Client, notificationChannelId?: string, eventName?: string, duration?: number): Promise<HuntingEvent>;
/**
 * Add hunting stats to user's event participation
 * Pontos: 1 pele = 50 pontos, 1 carne = 20 pontos
 */
export declare function addHuntingEventStats(userId: string, username: string, pelts: number, meat: number, animalName?: string): boolean;
/**
 * Get hunting event leaderboard
 */
export declare function getHuntingEventLeaderboard(): HuntingEventParticipant[];
/**
 * Get current hunting event
 */
export declare function getCurrentHuntingEvent(): HuntingEvent | null;
/**
 * Check and end hunting event if time is up
 */
export declare function checkAndEndHuntingEvent(client?: Client): Promise<boolean>;
//# sourceMappingURL=eventManager.d.ts.map