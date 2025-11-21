"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAutoMod = handleAutoMod;
exports.handleAutoModAll = handleAutoModAll;
const discord_js_1 = require("discord.js");
const autoModManager_1 = require("../../../utils/autoModManager");
const progressBar_1 = require("../../../utils/progressBar");
function createProgressBar(percentage) {
    return (0, progressBar_1.createProgressBarString)(percentage, 20, "█", "░");
}
async function handleAutoMod(interaction, subcommand) {
    if (subcommand === "setup") {
        await interaction.deferReply();
        try {
            const guild = interaction.guild;
            const logChannel = interaction.options.getChannel("log-channel");
            const rules = await autoModManager_1.AutoModManager.setupDefaultRules(guild, logChannel?.id);
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(discord_js_1.Colors.Green)
                .setTitle("🛡️ AutoMod Rules Created!")
                .setDescription(`Successfully created ${rules.length} AutoMod rules in **${guild.name}**`)
                .addFields(rules.map((rule) => ({
                name: rule.name,
                value: `✅ Active`,
                inline: true,
            })))
                .setFooter({
                text: "These rules help protect your server and earn the AutoMod badge!",
            })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            const errorEmbed = new discord_js_1.EmbedBuilder()
                .setColor(discord_js_1.Colors.Red)
                .setTitle("❌ Setup Failed")
                .setDescription(error.message || "Failed to create AutoMod rules")
                .setFooter({
                text: 'Make sure the bot has "Manage Server" permission',
            });
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
    else if (subcommand === "status") {
        await interaction.deferReply();
        try {
            const info = await autoModManager_1.AutoModManager.getDetailedRulesInfo(interaction.client);
            const progressBar = createProgressBar(info.badgeProgress);
            const badgeStatus = info.totalRules >= 100
                ? "✅ **Badge Earned!** (may take 12-24h to appear)"
                : `📊 **Progress:** ${info.totalRules}/100 rules`;
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(info.totalRules >= 100 ? discord_js_1.Colors.Gold : discord_js_1.Colors.Blue)
                .setTitle("🛡️ AutoMod Badge Progress")
                .setDescription(badgeStatus)
                .addFields({ name: "📈 Total Rules", value: `${info.totalRules}`, inline: true }, {
                name: "🏛️ Servers with Rules",
                value: `${info.guildsWithRules}/${info.totalGuilds}`,
                inline: true,
            }, {
                name: "🎯 Badge Progress",
                value: `${info.badgeProgress.toFixed(1)}%`,
                inline: true,
            }, { name: "\u200B", value: progressBar, inline: false })
                .setFooter({
                text: "Use /admin automod setup to create rules in more servers",
            })
                .setTimestamp();
            if (info.rulesPerGuild.size > 0) {
                const topServers = Array.from(info.rulesPerGuild.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([name, count]) => `• **${name}**: ${count} rules`)
                    .join("\n");
                embed.addFields({
                    name: "🏆 Top Servers",
                    value: topServers || "No servers with rules yet",
                    inline: false,
                });
            }
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            const errorEmbed = new discord_js_1.EmbedBuilder()
                .setColor(discord_js_1.Colors.Red)
                .setTitle("❌ Status Check Failed")
                .setDescription(error.message || "Failed to fetch AutoMod status");
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
    else if (subcommand === "clear") {
        await interaction.deferReply();
        try {
            const guild = interaction.guild;
            const deletedCount = await autoModManager_1.AutoModManager.clearGuildRules(guild);
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(discord_js_1.Colors.Orange)
                .setTitle("🗑️ AutoMod Rules Cleared")
                .setDescription(`Removed ${deletedCount} AutoMod rules from **${guild.name}**`)
                .setFooter({ text: "Use /admin automod setup to create new rules" })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            const errorEmbed = new discord_js_1.EmbedBuilder()
                .setColor(discord_js_1.Colors.Red)
                .setTitle("❌ Clear Failed")
                .setDescription(error.message || "Failed to clear AutoMod rules");
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
}
async function handleAutoModAll(interaction, subcommand) {
    if (subcommand === "setup") {
        await interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
        const client = interaction.client;
        const guilds = Array.from(client.guilds.cache.values());
        let successCount = 0;
        let failCount = 0;
        let totalRulesCreated = 0;
        const results = [];
        const progressEmbed = new discord_js_1.EmbedBuilder()
            .setColor(discord_js_1.Colors.Blue)
            .setTitle("🛡️ Setting up AutoMod...")
            .setDescription(`Processing ${guilds.length} servers...`)
            .setTimestamp();
        await interaction.editReply({ embeds: [progressEmbed] });
        for (const guild of guilds) {
            try {
                const rules = await autoModManager_1.AutoModManager.setupDefaultRules(guild);
                successCount++;
                totalRulesCreated += rules.length;
                results.push(`✅ **${guild.name}**: ${rules.length} rules created`);
            }
            catch (error) {
                failCount++;
                const errorMsg = error.message?.includes("permission")
                    ? "Missing permissions"
                    : "Failed";
                results.push(`❌ **${guild.name}**: ${errorMsg}`);
            }
        }
        const finalInfo = await autoModManager_1.AutoModManager.getDetailedRulesInfo(client);
        const badgeStatus = finalInfo.totalRules >= 100
            ? "🎉 **BADGE EARNED!** Wait 12-24h for it to appear on the bot profile"
            : `Need ${100 - finalInfo.totalRules} more rules for the badge`;
        const resultEmbed = new discord_js_1.EmbedBuilder()
            .setColor(finalInfo.totalRules >= 100 ? discord_js_1.Colors.Gold : discord_js_1.Colors.Green)
            .setTitle("🛡️ AutoMod Setup Complete!")
            .setDescription(badgeStatus)
            .addFields({
            name: "📊 Summary",
            value: `✅ Success: ${successCount}\n❌ Failed: ${failCount}\n📈 Total Rules: ${finalInfo.totalRules}`,
            inline: false,
        }, {
            name: "📝 Details",
            value: results.slice(0, 10).join("\n") +
                (results.length > 10
                    ? `\n*...and ${results.length - 10} more*`
                    : ""),
            inline: false,
        })
            .setFooter({
            text: `Created ${totalRulesCreated} new rules across ${successCount} servers`,
        })
            .setTimestamp();
        await interaction.editReply({ embeds: [resultEmbed] });
    }
    else if (subcommand === "clear") {
        await interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
        const client = interaction.client;
        const guilds = Array.from(client.guilds.cache.values());
        let totalDeleted = 0;
        let processedCount = 0;
        const progressEmbed = new discord_js_1.EmbedBuilder()
            .setColor(discord_js_1.Colors.Orange)
            .setTitle("🗑️ Clearing AutoMod rules...")
            .setDescription(`Processing ${guilds.length} servers...`)
            .setTimestamp();
        await interaction.editReply({ embeds: [progressEmbed] });
        for (const guild of guilds) {
            try {
                const deleted = await autoModManager_1.AutoModManager.clearGuildRules(guild);
                totalDeleted += deleted;
                processedCount++;
            }
            catch (error) {
                console.error(`Failed to clear rules in ${guild.name}:`, error);
            }
        }
        const resultEmbed = new discord_js_1.EmbedBuilder()
            .setColor(discord_js_1.Colors.Orange)
            .setTitle("🗑️ AutoMod Rules Cleared!")
            .setDescription(`Removed ${totalDeleted} rules from ${processedCount} servers`)
            .setFooter({ text: "Use /admin automodall setup to create new rules" })
            .setTimestamp();
        await interaction.editReply({ embeds: [resultEmbed] });
    }
}
//# sourceMappingURL=automod.js.map