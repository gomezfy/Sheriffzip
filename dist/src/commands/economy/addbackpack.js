"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const inventoryManager_1 = require("../../utils/inventoryManager");
const security_1 = require("../../utils/security");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("addbackpack")
        .setDescription("[OWNER ONLY] Manually upgrade a user's backpack to 500kg")
        .addUserOption((option) => option
        .setName("user")
        .setDescription("The user to upgrade")
        .setRequired(true))
        .setDefaultMemberPermissions(0),
    async execute(interaction) {
        await interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
        // Security: Validate owner
        if (!(await (0, security_1.isOwner)(interaction))) {
            return;
        }
        // Security: Rate limit admin commands
        if (!security_1.adminRateLimiter.canExecute(interaction.user.id)) {
            const remaining = security_1.adminRateLimiter.getRemainingCooldown(interaction.user.id);
            await interaction.editReply({
                content: `⏰ Please wait ${(remaining / 1000).toFixed(1)}s before using another admin command.`,
            });
            return;
        }
        const targetUser = interaction.options.getUser("user", true);
        const result = await (0, inventoryManager_1.upgradeBackpack)(targetUser.id, 500);
        if (!result.success) {
            await interaction.editReply({
                content: `❌ Failed to upgrade backpack: ${result.error}`,
            });
            return;
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setColor("#00FF00")
            .setTitle("✅ Backpack Upgraded!")
            .setDescription(`**${targetUser.tag}** now has a **500kg backpack**!`)
            .addFields({ name: "👤 User", value: `${targetUser}`, inline: true }, { name: "🎒 New Capacity", value: "500kg", inline: true })
            .setFooter({ text: "Manual upgrade by bot owner" })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    },
};
//# sourceMappingURL=addbackpack.js.map