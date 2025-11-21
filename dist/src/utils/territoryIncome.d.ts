import { Client } from "discord.js";
/**
 * Check if user can claim territory income
 * @param userId
 */
export declare function canClaimTerritoryIncome(userId: string): boolean;
/**
 * Get time until next payout
 * @param userId
 */
export declare function getTimeUntilNextPayout(userId: string): number;
/**
 * Process territory income for a user and send DM
 * @param client
 * @param userId
 */
export declare function processTerritoryIncome(client: Client, userId: string): Promise<boolean>;
/**
 * Process territory income for all users
 * @param client
 */
export declare function processAllTerritoryIncome(client: Client): Promise<void>;
/**
 * Start automatic territory income processing
 * Checks every hour and automatically pays users who are eligible
 * @param client
 */
export declare function startAutomaticTerritoryIncome(client: Client): NodeJS.Timeout;
//# sourceMappingURL=territoryIncome.d.ts.map