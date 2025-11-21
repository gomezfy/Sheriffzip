/**
 * AutoMod Manager for Sheriff Bot
 * Manages Discord AutoMod rules to earn the AutoMod badge
 * Requirement: 100+ active AutoMod rules across all servers
 */
import { Guild, AutoModerationRule, AutoModerationRuleTriggerType, AutoModerationRuleEventType, AutoModerationActionType } from "discord.js";
export interface AutoModRuleConfig {
    name: string;
    eventType: AutoModerationRuleEventType;
    triggerType: AutoModerationRuleTriggerType;
    triggerMetadata?: {
        keywordFilter?: string[];
        regexPatterns?: string[];
        presets?: number[];
        mentionTotalLimit?: number;
    };
    actions: Array<{
        type: AutoModerationActionType;
        metadata?: {
            channelId?: string;
            durationSeconds?: number;
            customMessage?: string;
        };
    }>;
    enabled?: boolean;
    exemptRoles?: string[];
    exemptChannels?: string[];
}
/**
 * Default AutoMod rule configurations for the western theme
 */
export declare const WESTERN_AUTOMOD_RULES: Omit<AutoModRuleConfig, "actions">[];
export declare class AutoModManager {
    /**
     * Creates default AutoMod rules in a guild
     * @param guild
     * @param logChannelId
     */
    static setupDefaultRules(guild: Guild, logChannelId?: string): Promise<AutoModerationRule[]>;
    /**
     * Gets total AutoMod rules count across all guilds (shard-aware)
     * @param client
     */
    static getTotalRulesCount(client: any): Promise<number>;
    /**
     * Gets detailed rules information for all guilds (shard-aware)
     * @param client
     */
    static getDetailedRulesInfo(client: any): Promise<{
        totalRules: number;
        guildsWithRules: number;
        totalGuilds: number;
        rulesPerGuild: Map<string, number>;
        badgeProgress: number;
    }>;
    /**
     * Removes all AutoMod rules from a guild
     * @param guild
     */
    static clearGuildRules(guild: Guild): Promise<number>;
    /**
     * Creates a custom AutoMod rule
     * @param guild
     * @param config
     */
    static createCustomRule(guild: Guild, config: AutoModRuleConfig): Promise<AutoModerationRule>;
}
//# sourceMappingURL=autoModManager.d.ts.map