"use strict";
const discord_js_1 = require("discord.js");
const openRouterService_1 = require("../../utils/openRouterService");
const sheriffContext_1 = require("../../utils/sheriffContext");
const i18n_1 = require("../../utils/i18n");
const customEmojis_1 = require("../../utils/customEmojis");
const cooldowns = new Map();
const COOLDOWN_TIME = 10000;
const MAX_MESSAGE_LENGTH = 500;
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("ai")
        .setDescription("Chat with Sheriff Rex - Your Wild West AI assistant! 🤠")
        .setDescriptionLocalizations({
        "pt-BR": "Converse com Sheriff Rex - Seu assistente IA do Velho Oeste! 🤠",
        "en-US": "Chat with Sheriff Rex - Your Wild West AI assistant! 🤠",
        "es-ES": "Chatea con Sheriff Rex - ¡Tu asistente IA del Viejo Oeste! 🤠",
    })
        .addStringOption((option) => option
        .setName("prompt")
        .setDescription("Your message to the AI")
        .setDescriptionLocalizations({
        "pt-BR": "Sua mensagem para a IA",
        "en-US": "Your message to the AI",
        "es-ES": "Tu mensaje para la IA",
    })
        .setRequired(true)
        .setMaxLength(MAX_MESSAGE_LENGTH))
        .addStringOption((option) => option
        .setName("model")
        .setDescription("AI model to use (default: meta-llama/llama-3.3-70b-instruct:free)")
        .setDescriptionLocalizations({
        "pt-BR": "Modelo de IA a usar (padrão: meta-llama/llama-3.3-70b-instruct:free)",
        "en-US": "AI model to use (default: meta-llama/llama-3.3-70b-instruct:free)",
        "es-ES": "Modelo de IA a usar (predeterminado: meta-llama/llama-3.3-70b-instruct:free)",
    })
        .setRequired(false))
        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1]),
    cooldown: 10,
    async execute(interaction) {
        const userId = interaction.user.id;
        const now = Date.now();
        const cooldownExpiry = cooldowns.get(userId);
        if (cooldownExpiry && now < cooldownExpiry) {
            const timeLeft = Math.ceil((cooldownExpiry - now) / 1000);
            await interaction.reply({
                content: `${(0, customEmojis_1.getEmoji)("cowboy")} ${(0, i18n_1.t)(interaction, "ai_cooldown", { time: timeLeft })}`,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        if (!openRouterService_1.openRouterService.isConfigured()) {
            await interaction.reply({
                content: `${(0, customEmojis_1.getEmoji)("cancel")} ${(0, i18n_1.t)(interaction, "ai_not_configured")}`,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const prompt = interaction.options.getString("prompt", true);
        const model = interaction.options.getString("model") || undefined;
        await interaction.deferReply();
        try {
            const messages = [
                {
                    role: "system",
                    content: `${sheriffContext_1.SHERIFF_PERSONALITY_PROMPT}\n\n${sheriffContext_1.SHERIFF_BOT_CONTEXT}`,
                },
                {
                    role: "user",
                    content: prompt,
                },
            ];
            const response = await openRouterService_1.openRouterService.chat(messages, model, 800);
            if (response.length > 1900) {
                const chunks = response.match(/.{1,1900}/g) || [response];
                await interaction.editReply({
                    content: `${(0, customEmojis_1.getEmoji)("info")} **${(0, i18n_1.t)(interaction, "ai_response")}**\n\n${chunks[0]}`,
                });
                for (let i = 1; i < chunks.length; i++) {
                    await interaction.followUp({
                        content: chunks[i],
                    });
                }
            }
            else {
                const embed = new discord_js_1.EmbedBuilder()
                    .setColor(0xd4af37)
                    .setTitle(`${(0, customEmojis_1.getEmoji)("cowboy")} ${(0, i18n_1.t)(interaction, "ai_sheriff_title")}`)
                    .setDescription(response)
                    .setFooter({
                    text: (0, i18n_1.t)(interaction, "ai_model_footer", {
                        model: model || openRouterService_1.openRouterService.getDefaultModel(),
                        user: interaction.user.tag,
                    }),
                })
                    .setTimestamp();
                await interaction.editReply({
                    embeds: [embed],
                });
            }
            cooldowns.set(userId, now + COOLDOWN_TIME);
            setTimeout(() => cooldowns.delete(userId), COOLDOWN_TIME);
        }
        catch (error) {
            console.error("Error in /ai command:", error);
            const errorMessage = error.message || "Unknown error occurred";
            await interaction.editReply({
                content: `${(0, customEmojis_1.getEmoji)("cancel")} **${(0, i18n_1.t)(interaction, "ai_error")}**\n${errorMessage}`,
            });
        }
    },
};
//# sourceMappingURL=ai.js.map