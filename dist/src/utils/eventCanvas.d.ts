export interface EventCanvasData {
    miningEvent?: {
        name: string;
        active: boolean;
        timeRemaining: string;
        phase: number;
        leaderboard: Array<{
            position: number;
            username: string;
            goldMined: number;
            points: number;
        }>;
    };
    huntingEvent?: {
        name: string;
        active: boolean;
        timeRemaining: string;
        phase: number;
        leaderboard: Array<{
            position: number;
            username: string;
            animalsKilled: number;
            points: number;
        }>;
    };
    nextEvent?: {
        date: string;
        timeUntil: string;
    };
}
export declare function createEventCanvas(data: EventCanvasData): Promise<Buffer>;
/**
 * Create events overview canvas showing active and next events
 *
 * @param nextEventType - Type of next scheduled event (always "mining" in practice,
 *                        as hunting events are initiated manually and have no fixed schedule)
 */
export declare function createEventsOverviewCanvas(miningActive: boolean, miningTimeRemaining: string, huntingActive: boolean, huntingTimeRemaining: string, nextEventType: "mining" | "hunting", nextEventName: string, nextEventDate: string, nextEventTimeUntil: string): Promise<Buffer>;
/**
 * Create prizes canvas for mining and hunting events
 */
export declare function createPrizesCanvas(eventType: "mining" | "hunting"): Promise<Buffer>;
/**
 * Create classification/leaderboard canvas
 */
export declare function createClassificationCanvas(eventType: "mining" | "hunting", leaderboard: Array<{
    position: number;
    username: string;
    points: number;
    goldMined?: number;
    animalsKilled?: number;
}>, eventName: string, timeRemaining: string, active: boolean): Promise<Buffer>;
//# sourceMappingURL=eventCanvas.d.ts.map