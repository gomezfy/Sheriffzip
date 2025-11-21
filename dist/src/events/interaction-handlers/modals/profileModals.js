"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleProfileModals = handleProfileModals;
const discord_js_1 = require("discord.js");
const profileManager_1 = require("../../../utils/profileManager");
const guildManager_1 = require("../../../utils/guildManager");
const i18n_1 = require("../../../utils/i18n");
async function handleProfileModals(interaction) {
    const { customId } = interaction;
    if (customId === "bio_modal") {
        await handleBioModal(interaction);
        return true;
    }
    if (customId === "phrase_modal") {
        await handlePhraseModal(interaction);
        return true;
    }
    if (customId === "guild_create_modal_new") {
        await handleGuildCreateModal(interaction);
        return true;
    }
    return false;
}
async function handleBioModal(interaction) {
    const bioText = interaction.fields.getTextInputValue("bio_text");
    (0, profileManager_1.setUserBio)(interaction.user.id, bioText);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor("#57F287")
        .setTitle("✅ Bio Updated!")
        .setDescription("Your profile bio has been updated successfully.")
        .addFields({ name: "📝 New Bio", value: bioText, inline: false })
        .setFooter({ text: "Use /profile to see your updated card" })
        .setTimestamp();
    await interaction.reply({
        embeds: [embed],
        flags: discord_js_1.MessageFlags.Ephemeral,
    });
}
async function handlePhraseModal(interaction) {
    const phraseText = interaction.fields.getTextInputValue("phrase_text");
    (0, profileManager_1.setUserPhrase)(interaction.user.id, phraseText);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor("#D4AF37")
        .setTitle("✅ Frase Atualizada!")
        .setDescription("Sua frase pessoal foi atualizada com sucesso.")
        .addFields({
        name: "💬 Nova Frase",
        value: phraseText || "*(removida)*",
        inline: false,
    })
        .setFooter({ text: "Use /profile para ver seu card atualizado" })
        .setTimestamp();
    await interaction.reply({
        embeds: [embed],
        flags: discord_js_1.MessageFlags.Ephemeral,
    });
}
async function handleGuildCreateModal(interaction) {
    const guildName = interaction.fields.getTextInputValue("guild_name");
    const guildDescription = interaction.fields.getTextInputValue("guild_description");
    const privacyInput = interaction.fields
        .getTextInputValue("guild_privacy")
        .toLowerCase()
        .trim();
    let isPublic = true;
    const privateTerms = [
        "privada",
        "private",
        "priv",
        "no",
        "não",
        "nao",
        "false",
    ];
    const publicTerms = [
        "pública",
        "publica",
        "public",
        "pub",
        "yes",
        "sim",
        "true",
    ];
    if (privateTerms.some((term) => privacyInput.includes(term))) {
        isPublic = false;
    }
    else if (publicTerms.some((term) => privacyInput.includes(term))) {
        isPublic = true;
    }
    else {
        await interaction.reply({
            content: (0, i18n_1.tUser)(interaction.user.id, "guild_invalid_privacy"),
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const result = await (0, guildManager_1.createGuild)(interaction.user.id, guildName, guildDescription, isPublic);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(result.success ? "#57F287" : "#ED4245")
        .setTitle(result.success
        ? (0, i18n_1.tUser)(interaction.user.id, "guild_created_title")
        : "❌ Erro")
        .setDescription(result.message)
        .setTimestamp();
    if (result.success && result.guild) {
        embed.addFields({
            name: `🏰 ${(0, i18n_1.tUser)(interaction.user.id, "guild_name")}`,
            value: result.guild.name,
            inline: true,
        }, {
            name: `👑 ${(0, i18n_1.tUser)(interaction.user.id, "guild_leader")}`,
            value: `<@${interaction.user.id}>`,
            inline: true,
        }, {
            name: `🔓 ${(0, i18n_1.tUser)(interaction.user.id, "guild_type")}`,
            value: result.guild.settings.isPublic
                ? (0, i18n_1.tUser)(interaction.user.id, "guild_type_public")
                : (0, i18n_1.tUser)(interaction.user.id, "guild_type_private"),
            inline: true,
        }, {
            name: `📝 ${(0, i18n_1.tUser)(interaction.user.id, "guild_description")}`,
            value: result.guild.description,
            inline: false,
        });
    }
    await interaction.reply({
        embeds: [embed],
        flags: discord_js_1.MessageFlags.Ephemeral,
    });
}
//# sourceMappingURL=profileModals.js.map