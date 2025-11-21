"use strict";
/**
 * AutoMod Manager for Sheriff Bot
 * Manages Discord AutoMod rules to earn the AutoMod badge
 * Requirement: 100+ active AutoMod rules across all servers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoModManager = exports.WESTERN_AUTOMOD_RULES = void 0;
const discord_js_1 = require("discord.js");
/**
 * Default AutoMod rule configurations for the western theme
 */
exports.WESTERN_AUTOMOD_RULES = [
    {
        name: "🤠 Sheriff - Spam Protection",
        eventType: discord_js_1.AutoModerationRuleEventType.MessageSend,
        triggerType: discord_js_1.AutoModerationRuleTriggerType.Spam,
        enabled: true,
    },
    {
        name: "🤠 Sheriff - Mention Spam (5 limit)",
        eventType: discord_js_1.AutoModerationRuleEventType.MessageSend,
        triggerType: discord_js_1.AutoModerationRuleTriggerType.MentionSpam,
        triggerMetadata: {
            mentionTotalLimit: 5,
        },
        enabled: true,
    },
    {
        name: "🤠 Sheriff - Sexual Content Block",
        eventType: discord_js_1.AutoModerationRuleEventType.MessageSend,
        triggerType: discord_js_1.AutoModerationRuleTriggerType.KeywordPreset,
        triggerMetadata: {
            presets: [1, 3], // 1 = Profanity, 3 = Sexual Content
        },
        enabled: true,
    },
    {
        name: "🤠 Sheriff - Profanity Filter",
        eventType: discord_js_1.AutoModerationRuleEventType.MessageSend,
        triggerType: discord_js_1.AutoModerationRuleTriggerType.Keyword,
        triggerMetadata: {
            keywordFilter: ["scam", "free nitro", "discord.gift", "steal"],
        },
        enabled: true,
    },
    {
        name: "🤠 Sheriff - Invite Links Block",
        eventType: discord_js_1.AutoModerationRuleEventType.MessageSend,
        triggerType: discord_js_1.AutoModerationRuleTriggerType.Keyword,
        triggerMetadata: {
            regexPatterns: [
                "discord\\.gg\\/[a-zA-Z0-9]+",
                "discord\\.com\\/invite\\/[a-zA-Z0-9]+",
            ],
        },
        enabled: true,
    },
    {
        name: "🤠 Sheriff - Suspicious Links",
        eventType: discord_js_1.AutoModerationRuleEventType.MessageSend,
        triggerType: discord_js_1.AutoModerationRuleTriggerType.Keyword,
        triggerMetadata: {
            regexPatterns: ["bit\\.ly", "tinyurl\\.com", "grabify"],
        },
        enabled: true,
    },
];
class AutoModManager {
    /**
     * Creates default AutoMod rules in a guild
     * @param guild
     * @param logChannelId
     */
    static async setupDefaultRules(guild, logChannelId) {
        const createdRules = [];
        // Check bot permissions
        const botMember = await guild.members.fetch(guild.client.user.id);
        if (!botMember.permissions.has(discord_js_1.PermissionFlagsBits.ManageGuild)) {
            throw new Error('Bot needs "Manage Server" permission to create AutoMod rules');
        }
        // Default actions for all rules
        const defaultActions = [
            { type: discord_js_1.AutoModerationActionType.BlockMessage },
            ...(logChannelId
                ? [
                    {
                        type: discord_js_1.AutoModerationActionType.SendAlertMessage,
                        metadata: { channelId: logChannelId },
                    },
                ]
                : []),
        ];
        for (const ruleConfig of exports.WESTERN_AUTOMOD_RULES) {
            try {
                const rule = await guild.autoModerationRules.create({
                    name: ruleConfig.name,
                    eventType: ruleConfig.eventType,
                    triggerType: ruleConfig.triggerType,
                    triggerMetadata: ruleConfig.triggerMetadata,
                    actions: defaultActions,
                    enabled: ruleConfig.enabled ?? true,
                    exemptRoles: ruleConfig.exemptRoles,
                    exemptChannels: ruleConfig.exemptChannels,
                });
                createdRules.push(rule);
            }
            catch (error) {
                // Skip if rule already exists or max rules reached
                if (error.code === 50035 || error.code === 160004) {
                    continue;
                }
                console.error(`Failed to create rule "${ruleConfig.name}":`, error.message);
            }
        }
        return createdRules;
    }
    /**
     * Gets total AutoMod rules count across all guilds (shard-aware)
     * @param client
     */
    static async getTotalRulesCount(client) {
        if (!client.shard) {
            // Single shard or no sharding - use local cache
            const guilds = Array.from(client.guilds.cache.values());
            let totalCount = 0;
            for (const guild of guilds) {
                try {
                    const rules = await guild.autoModerationRules.fetch();
                    totalCount += rules.size;
                }
                catch (error) {
                    console.error(`Failed to fetch rules for guild ${guild.name}:`, error);
                }
            }
            return totalCount;
        }
        // Multi-shard - aggregate across all shards
        const results = await client.shard.broadcastEval(async (c) => {
            let count = 0;
            for (const guild of c.guilds.cache.values()) {
                try {
                    const rules = await guild.autoModerationRules.fetch();
                    count += rules.size;
                }
                catch (error) {
                    // Skip guilds we can't access
                }
            }
            return count;
        });
        return results.reduce((acc, val) => acc + val, 0);
    }
    /**
     * Gets detailed rules information for all guilds (shard-aware)
     * @param client
     */
    static async getDetailedRulesInfo(client) {
        if (!client.shard) {
            // Single shard or no sharding - use local cache
            const guilds = Array.from(client.guilds.cache.values());
            const rulesPerGuild = new Map();
            let totalRules = 0;
            let guildsWithRules = 0;
            for (const guild of guilds) {
                try {
                    const rules = await guild.autoModerationRules.fetch();
                    const count = rules.size;
                    if (count > 0) {
                        guildsWithRules++;
                        rulesPerGuild.set(guild.name, count);
                        totalRules += count;
                    }
                }
                catch (error) {
                    console.error(`Failed to fetch rules for guild ${guild.name}:`, error);
                }
            }
            const badgeProgress = Math.min(100, (totalRules / 100) * 100);
            return {
                totalRules,
                guildsWithRules,
                totalGuilds: guilds.length,
                rulesPerGuild,
                badgeProgress,
            };
        }
        // Multi-shard - aggregate across all shards
        const shardResults = await client.shard.broadcastEval(async (c) => {
            const guildsInfo = [];
            let totalRules = 0;
            let guildsWithRules = 0;
            for (const guild of c.guilds.cache.values()) {
                try {
                    const rules = await guild.autoModerationRules.fetch();
                    const count = rules.size;
                    if (count > 0) {
                        guildsWithRules++;
                        guildsInfo.push({ name: guild.name, count });
                        totalRules += count;
                    }
                }
                catch (error) {
                    // Skip guilds we can't access
                }
            }
            return {
                guildsInfo,
                totalRules,
                guildsWithRules,
                totalGuilds: c.guilds.cache.size,
            };
        });
        // Aggregate results from all shards
        const rulesPerGuild = new Map();
        let totalRules = 0;
        let guildsWithRules = 0;
        let totalGuilds = 0;
        for (const result of shardResults) {
            totalRules += result.totalRules;
            guildsWithRules += result.guildsWithRules;
            totalGuilds += result.totalGuilds;
            for (const guild of result.guildsInfo) {
                rulesPerGuild.set(guild.name, guild.count);
            }
        }
        const badgeProgress = Math.min(100, (totalRules / 100) * 100);
        return {
            totalRules,
            guildsWithRules,
            totalGuilds,
            rulesPerGuild,
            badgeProgress,
        };
    }
    /**
     * Removes all AutoMod rules from a guild
     * @param guild
     */
    static async clearGuildRules(guild) {
        const rules = await guild.autoModerationRules.fetch();
        let deletedCount = 0;
        for (const rule of rules.values()) {
            try {
                await rule.delete();
                deletedCount++;
            }
            catch (error) {
                console.error(`Failed to delete rule "${rule.name}":`, error);
            }
        }
        return deletedCount;
    }
    /**
     * Creates a custom AutoMod rule
     * @param guild
     * @param config
     */
    static async createCustomRule(guild, config) {
        const botMember = await guild.members.fetch(guild.client.user.id);
        if (!botMember.permissions.has(discord_js_1.PermissionFlagsBits.ManageGuild)) {
            throw new Error('Bot needs "Manage Server" permission to create AutoMod rules');
        }
        return await guild.autoModerationRules.create({
            name: config.name,
            eventType: config.eventType,
            triggerType: config.triggerType,
            triggerMetadata: config.triggerMetadata,
            actions: config.actions,
            enabled: config.enabled ?? true,
            exemptRoles: config.exemptRoles,
            exemptChannels: config.exemptChannels,
        });
    }
}
exports.AutoModManager = AutoModManager;
//# sourceMappingURL=autoModManager.js.map