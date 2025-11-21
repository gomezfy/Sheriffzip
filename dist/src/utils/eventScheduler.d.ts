import { Client } from "discord.js";
/**
 * Start event scheduler
 * Events start every Sunday at 23:59
 */
export declare function startEventScheduler(client: Client, notificationChannelId?: string): Promise<void>;
/**
 * Stop event scheduler
 */
export declare function stopEventScheduler(): void;
/**
 * Manual start event (for testing or admin commands)
 */
export declare function manualStartEvent(client: Client, notificationChannelId?: string): Promise<void>;
//# sourceMappingURL=eventScheduler.d.ts.map