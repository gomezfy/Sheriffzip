"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const i18n_1 = require("../../utils/i18n");
const embedTemplates_1 = require("../../utils/embeds/embedTemplates");
const validation_1 = require("./embedbuilder/validation");
const iconManager_1 = require("../../utils/iconManager");
const COLOR_PRESETS = {
    blue: { name: "🔵 Discord Blue", hex: "#5865F2" },
    green: { name: "🟢 Success Green", hex: "#57F287" },
    red: { name: "🔴 Danger Red", hex: "#ED4245" },
    yellow: { name: "🟡 Warning Yellow", hex: "#FEE75C" },
    purple: { name: "🟣 Purple", hex: "#9B59B6" },
    orange: { name: "🟠 Orange", hex: "#E67E22" },
    pink: { name: "💗 Pink", hex: "#EB459E" },
    cyan: { name: "🩵 Cyan", hex: "#00D9FF" },
    lime: { name: "💚 Lime", hex: "#00FF7F" },
    brown: { name: "🟤 Brown (Western)", hex: "#8B4513" },
    gold: { name: "🏆 Gold (Western)", hex: "#D4A017" },
    crimson: { name: "❤️ Crimson (Western)", hex: "#8B0000" },
    tan: { name: "🎨 Tan (Western)", hex: "#D2B48C" },
    darkgreen: { name: "🌲 Dark Green", hex: "#2F4F2F" },
    gray: { name: "⚫ Gray", hex: "#99AAB5" },
    white: { name: "⚪ White", hex: "#FFFFFF" },
    black: { name: "⬛ Black", hex: "#000000" },
    navy: { name: "🔷 Navy", hex: "#000080" },
    teal: { name: "🩵 Teal", hex: "#008080" },
    magenta: { name: "💜 Magenta", hex: "#FF00FF" },
};
const embedSessions = new Map();
const SESSION_TIMEOUT = 1800000; // 30 minutos
const WARNING_TIME = 1500000; // 25 minutos (5 min antes de expirar)
function resetSessionTimeout(sessionId) {
    const session = embedSessions.get(sessionId);
    if (!session)
        return;
    // Limpar timeouts anteriores
    if (session.timeoutId) {
        clearTimeout(session.timeoutId);
    }
    if (session.warningTimeoutId) {
        clearTimeout(session.warningTimeoutId);
    }
    // Aviso 5 minutos antes de expirar
    session.warningTimeoutId = setTimeout(async () => {
        const sess = embedSessions.get(sessionId);
        if (sess) {
            try {
                const user = await sess.interaction.client.users.fetch(sess.userId);
                await user.send(`⚠️ **Aviso de Inatividade - /embedbuilder**\n\nSua sessão de edição do embed expirará em 5 minutos. Faça qualquer edição para renovar o tempo.`);
            }
            catch (error) {
                // Se DM falhar, envia mensagem no canal
                try {
                    if (sess.interactionChannel) {
                        await sess.interactionChannel.send(`<@${sess.userId}> ⚠️ Sua sessão de edição do embed expirará em 5 minutos! Faça qualquer edição para renovar.`);
                    }
                }
                catch (channelError) {
                    console.error("Failed to send warning message:", channelError);
                }
            }
        }
    }, WARNING_TIME);
    // Timeout final
    session.timeoutId = setTimeout(async () => {
        const sess = embedSessions.get(sessionId);
        if (sess) {
            try {
                if (sess.replyMessage) {
                    // Edita mensagem followUp diretamente (não-ephemeral, funciona indefinidamente)
                    await sess.replyMessage.edit({
                        content: `⏰ **Sessão Expirada**\n\nSua sessão de edição expirou após 30 minutos de inatividade. Use \`/embedbuilder\` novamente para criar um novo embed.`,
                        embeds: [],
                        components: [],
                    });
                }
            }
            catch (error) {
                console.error("Error updating expired session message:", error);
            }
            if (sess.collector)
                sess.collector.stop();
            embedSessions.delete(sessionId);
        }
    }, SESSION_TIMEOUT);
}
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("embedbuilder")
        .setDescription("Create professional embeds")
        .setDescriptionLocalizations({
        "pt-BR": "Criar embeds profissionais",
    })
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
        .addChannelOption((option) => option
        .setName("channel")
        .setDescription("Channel to send the embed")
        .setDescriptionLocalizations({
        "pt-BR": "Canal para enviar o embed",
    })
        .addChannelTypes(discord_js_1.ChannelType.GuildText)
        .setRequired(true)),
    async execute(interaction) {
        const channel = interaction.options.getChannel("channel", true);
        if (!channel || !("send" in channel)) {
            await interaction.reply({
                content: (0, i18n_1.t)(interaction, "eb_invalid_channel"),
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const sessionId = `${interaction.user.id}-${Date.now()}`;
        const embedData = {
            fields: [],
            timestamp: true,
            color: "#5865F2",
        };
        const previewEmbed = buildPreviewEmbed(embedData, interaction);
        const components = buildComponents(sessionId, embedData, interaction);
        // Reply ephemeral simples
        await interaction.reply({
            content: `✨ **${(0, i18n_1.t)(interaction, "eb_title")}**\n\n📝 **Editor Avançado de Embeds**\nUse os botões abaixo para criar seu embed personalizado.\n\n⏰ Sessão expira em 30 minutos de inatividade\n💡 Suporta imagens, campos, cores personalizadas e mais!`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        // FollowUp não-ephemeral com preview (pode ser editado indefinidamente)
        const previewMessage = await interaction.followUp({
            content: `🔍 **${(0, i18n_1.t)(interaction, "eb_preview")}** | Canal de destino: ${channel}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            embeds: [previewEmbed],
            components,
        });
        embedSessions.set(sessionId, {
            embedData,
            channel,
            interaction,
            userId: interaction.user.id,
            replyMessage: previewMessage,
            interactionChannel: interaction.channel,
        });
        resetSessionTimeout(sessionId);
        setupCollectors(sessionId);
    },
};
function buildComponents(sessionId, embedData, interaction) {
    // ━━━ LINHA 1: 📝 EDITAR CONTEÚDO (3 botões) ━━━
    const rowContent = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`eb_basic_${sessionId}`)
        .setLabel("Conteúdo")
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setEmoji((0, iconManager_1.getIconEmoji)("eb_basic")), new discord_js_1.ButtonBuilder()
        .setCustomId(`eb_author_${sessionId}`)
        .setLabel("Autor")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setEmoji((0, iconManager_1.getIconEmoji)("eb_author")), new discord_js_1.ButtonBuilder()
        .setCustomId(`eb_footer_${sessionId}`)
        .setLabel("Rodapé")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setEmoji((0, iconManager_1.getIconEmoji)("eb_footer")));
    // ━━━ LINHA 2: 🎨 ESTILO & CAMPOS (5 botões) ━━━
    const rowStyle = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`eb_color_${sessionId}`)
        .setLabel("Cor")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setEmoji((0, iconManager_1.getIconEmoji)("eb_color")), new discord_js_1.ButtonBuilder()
        .setCustomId(`eb_images_${sessionId}`)
        .setLabel("Imagens")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setEmoji((0, iconManager_1.getIconEmoji)("eb_images")), new discord_js_1.ButtonBuilder()
        .setCustomId(`eb_timestamp_${sessionId}`)
        .setLabel(embedData.timestamp ? "⏱️ Remover" : "🕐 Timestamp")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setEmoji(embedData.timestamp ? "⏱" : "🕐"), new discord_js_1.ButtonBuilder()
        .setCustomId(`eb_addfield_${sessionId}`)
        .setLabel("➕ Campo")
        .setStyle(discord_js_1.ButtonStyle.Success)
        .setEmoji((0, iconManager_1.getIconEmoji)("eb_addfield")), new discord_js_1.ButtonBuilder()
        .setCustomId(`eb_managefields_${sessionId}`)
        .setLabel(`Campos (${embedData.fields.length})`)
        .setStyle(embedData.fields.length > 0 ? discord_js_1.ButtonStyle.Primary : discord_js_1.ButtonStyle.Secondary)
        .setEmoji((0, iconManager_1.getIconEmoji)("eb_managefields"))
        .setDisabled(embedData.fields.length === 0));
    // ━━━ LINHA 3: 🔧 FERRAMENTAS (4 botões) ━━━
    const rowTools = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`eb_template_${sessionId}`)
        .setLabel("Templates")
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setEmoji((0, iconManager_1.getIconEmoji)("eb_template")), new discord_js_1.ButtonBuilder()
        .setCustomId(`eb_import_${sessionId}`)
        .setLabel("Importar")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setEmoji((0, iconManager_1.getIconEmoji)("eb_import")), new discord_js_1.ButtonBuilder()
        .setCustomId(`eb_export_${sessionId}`)
        .setLabel("Exportar")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setEmoji((0, iconManager_1.getIconEmoji)("eb_export")), new discord_js_1.ButtonBuilder()
        .setCustomId(`eb_clear_${sessionId}`)
        .setLabel("Limpar")
        .setStyle(discord_js_1.ButtonStyle.Danger)
        .setEmoji((0, iconManager_1.getIconEmoji)("eb_clear")));
    // ━━━ LINHA 4: ✅ AÇÕES FINAIS (2 botões) ━━━
    const rowActions = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`eb_send_${sessionId}`)
        .setLabel("Enviar Embed")
        .setStyle(discord_js_1.ButtonStyle.Success)
        .setEmoji((0, iconManager_1.getIconEmoji)("eb_send")), new discord_js_1.ButtonBuilder()
        .setCustomId(`eb_cancel_${sessionId}`)
        .setLabel("Cancelar")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setEmoji((0, iconManager_1.getIconEmoji)("eb_cancel")));
    return [rowContent, rowStyle, rowTools, rowActions];
}
async function updatePreview(sessionId) {
    const session = embedSessions.get(sessionId);
    if (!session)
        return;
    const { embedData, channel, interaction, replyMessage } = session;
    const previewEmbed = buildPreviewEmbed(embedData, interaction);
    const components = buildComponents(sessionId, embedData, interaction);
    const statsEmoji = embedData.fields.length > 0 ? "✏️" : "📝";
    const imageEmoji = (embedData.image || embedData.thumbnail) ? "🖼️" : "";
    const content = `🔍 **${(0, i18n_1.t)(interaction, "eb_preview")}** | Canal de destino: ${channel}\n${statsEmoji} ${embedData.fields.length} campos ${imageEmoji}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    try {
        // Edita mensagem followUp não-ephemeral diretamente (funciona indefinidamente)
        await replyMessage.edit({
            content,
            embeds: [previewEmbed],
            components,
        });
    }
    catch (error) {
        console.error("Error updating preview:", error);
    }
}
async function setupCollectors(sessionId) {
    const session = embedSessions.get(sessionId);
    if (!session)
        return;
    const { userId, replyMessage } = session;
    const buttonCollector = replyMessage.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.Button,
    });
    session.collector = buttonCollector;
    buttonCollector.on("collect", async (i) => {
        if (i.user.id !== userId) {
            await i.reply({
                content: (0, i18n_1.t)(i, "eb_only_author"),
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const action = i.customId.split("_")[1];
        if (action === "basic") {
            await handleBasicModal(i, sessionId);
        }
        else if (action === "author") {
            await handleAuthorModal(i, sessionId);
        }
        else if (action === "images") {
            await handleImagesModal(i, sessionId);
        }
        else if (action === "footer") {
            await handleFooterModal(i, sessionId);
        }
        else if (action === "addfield") {
            await handleFieldModal(i, sessionId);
        }
        else if (action === "managefields") {
            await handleManageFieldsMenu(i, sessionId);
        }
        else if (action === "template") {
            await handleTemplateMenu(i, sessionId);
        }
        else if (action === "color") {
            await handleColorMenu(i, sessionId);
        }
        else if (action === "timestamp") {
            await handleTimestamp(i, sessionId);
        }
        else if (action === "clear") {
            await handleClear(i, sessionId);
        }
        else if (action === "import") {
            await handleImportJson(i, sessionId);
        }
        else if (action === "export") {
            await handleExportJson(i, sessionId);
        }
        else if (action === "send") {
            await handleSend(i, sessionId);
            buttonCollector.stop();
        }
        else if (action === "cancel") {
            await handleCancel(i, sessionId);
            buttonCollector.stop();
        }
    });
    buttonCollector.on("end", () => {
        const sess = embedSessions.get(sessionId);
        if (sess) {
            if (sess.timeoutId)
                clearTimeout(sess.timeoutId);
            if (sess.warningTimeoutId)
                clearTimeout(sess.warningTimeoutId);
            embedSessions.delete(sessionId);
        }
    });
}
async function handleBasicModal(interaction, sessionId) {
    const session = embedSessions.get(sessionId);
    if (!session)
        return;
    const { embedData } = session;
    const modal = new discord_js_1.ModalBuilder()
        .setCustomId(`eb_basic_modal_${sessionId}`)
        .setTitle((0, i18n_1.t)(interaction, "eb_modal_basic_title"));
    const titleInput = new discord_js_1.TextInputBuilder()
        .setCustomId("title")
        .setLabel((0, i18n_1.t)(interaction, "eb_modal_basic_title_label"))
        .setStyle(discord_js_1.TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(256)
        .setPlaceholder((0, i18n_1.t)(interaction, "eb_modal_basic_title_placeholder"));
    if (embedData.title)
        titleInput.setValue(embedData.title);
    const descriptionInput = new discord_js_1.TextInputBuilder()
        .setCustomId("description")
        .setLabel((0, i18n_1.t)(interaction, "eb_modal_basic_desc_label"))
        .setStyle(discord_js_1.TextInputStyle.Paragraph)
        .setRequired(false)
        .setMaxLength(4000)
        .setPlaceholder((0, i18n_1.t)(interaction, "eb_modal_basic_desc_placeholder") + " (use \\n para quebra de linha)");
    if (embedData.description)
        descriptionInput.setValue(embedData.description);
    const urlInput = new discord_js_1.TextInputBuilder()
        .setCustomId("url")
        .setLabel((0, i18n_1.t)(interaction, "eb_modal_basic_url_label"))
        .setStyle(discord_js_1.TextInputStyle.Short)
        .setRequired(false)
        .setPlaceholder("https://example.com");
    if (embedData.url)
        urlInput.setValue(embedData.url);
    modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(titleInput), new discord_js_1.ActionRowBuilder().addComponents(descriptionInput), new discord_js_1.ActionRowBuilder().addComponents(urlInput));
    await interaction.showModal(modal);
    const submitted = await interaction
        .awaitModalSubmit({
        time: 300000,
        filter: (i) => i.customId === `eb_basic_modal_${sessionId}`,
    })
        .catch(() => null);
    if (submitted) {
        await submitted.deferUpdate();
        const session = embedSessions.get(sessionId);
        if (session) {
            const title = submitted.fields.getTextInputValue("title").trim();
            const description = submitted.fields
                .getTextInputValue("description")
                .trim();
            const url = submitted.fields.getTextInputValue("url").trim();
            session.embedData.title = title || undefined;
            session.embedData.description = description
                ? description.replace(/\\n/g, "\n")
                : undefined;
            session.embedData.url = url || undefined;
            resetSessionTimeout(sessionId);
            await updatePreview(sessionId);
        }
    }
}
async function handleAuthorModal(interaction, sessionId) {
    const session = embedSessions.get(sessionId);
    if (!session)
        return;
    const { embedData } = session;
    const modal = new discord_js_1.ModalBuilder()
        .setCustomId(`eb_author_modal_${sessionId}`)
        .setTitle((0, i18n_1.t)(interaction, "eb_modal_author_title"));
    const nameInput = new discord_js_1.TextInputBuilder()
        .setCustomId("name")
        .setLabel((0, i18n_1.t)(interaction, "eb_modal_author_name_label"))
        .setStyle(discord_js_1.TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(256)
        .setPlaceholder((0, i18n_1.t)(interaction, "eb_modal_author_name_placeholder"));
    if (embedData.authorName)
        nameInput.setValue(embedData.authorName);
    const iconInput = new discord_js_1.TextInputBuilder()
        .setCustomId("icon")
        .setLabel((0, i18n_1.t)(interaction, "eb_modal_author_icon_label"))
        .setStyle(discord_js_1.TextInputStyle.Short)
        .setRequired(false)
        .setPlaceholder((0, i18n_1.t)(interaction, "eb_modal_author_icon_placeholder"));
    if (embedData.authorIcon)
        iconInput.setValue(embedData.authorIcon);
    const urlInput = new discord_js_1.TextInputBuilder()
        .setCustomId("url")
        .setLabel((0, i18n_1.t)(interaction, "eb_modal_author_url_label"))
        .setStyle(discord_js_1.TextInputStyle.Short)
        .setRequired(false)
        .setPlaceholder((0, i18n_1.t)(interaction, "eb_modal_author_url_placeholder"));
    if (embedData.authorUrl)
        urlInput.setValue(embedData.authorUrl);
    modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(nameInput), new discord_js_1.ActionRowBuilder().addComponents(iconInput), new discord_js_1.ActionRowBuilder().addComponents(urlInput));
    await interaction.showModal(modal);
    const submitted = await interaction
        .awaitModalSubmit({
        time: 300000,
        filter: (i) => i.customId === `eb_author_modal_${sessionId}`,
    })
        .catch(() => null);
    if (submitted) {
        await submitted.deferUpdate();
        const session = embedSessions.get(sessionId);
        if (session) {
            const name = submitted.fields.getTextInputValue("name").trim();
            const icon = submitted.fields.getTextInputValue("icon").trim();
            const url = submitted.fields.getTextInputValue("url").trim();
            session.embedData.authorName = name || undefined;
            session.embedData.authorIcon = icon || undefined;
            session.embedData.authorUrl = url || undefined;
            resetSessionTimeout(sessionId);
            await updatePreview(sessionId);
        }
    }
}
async function handleImagesModal(interaction, sessionId) {
    const session = embedSessions.get(sessionId);
    if (!session)
        return;
    const { embedData } = session;
    const modal = new discord_js_1.ModalBuilder()
        .setCustomId(`eb_images_modal_${sessionId}`)
        .setTitle((0, i18n_1.t)(interaction, "eb_modal_images_title"));
    const thumbnailInput = new discord_js_1.TextInputBuilder()
        .setCustomId("thumbnail")
        .setLabel((0, i18n_1.t)(interaction, "eb_modal_images_thumbnail_label"))
        .setStyle(discord_js_1.TextInputStyle.Short)
        .setRequired(false)
        .setPlaceholder("https://example.com/image.png ou attachment://file.png");
    if (embedData.thumbnail)
        thumbnailInput.setValue(embedData.thumbnail);
    const imageInput = new discord_js_1.TextInputBuilder()
        .setCustomId("image")
        .setLabel((0, i18n_1.t)(interaction, "eb_modal_images_image_label"))
        .setStyle(discord_js_1.TextInputStyle.Short)
        .setRequired(false)
        .setPlaceholder("https://example.com/image.png ou attachment://file.png");
    if (embedData.image)
        imageInput.setValue(embedData.image);
    modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(thumbnailInput), new discord_js_1.ActionRowBuilder().addComponents(imageInput));
    await interaction.showModal(modal);
    const submitted = await interaction
        .awaitModalSubmit({
        time: 300000,
        filter: (i) => i.customId === `eb_images_modal_${sessionId}`,
    })
        .catch(() => null);
    if (submitted) {
        await submitted.deferUpdate();
        const session = embedSessions.get(sessionId);
        if (session) {
            const thumbnail = submitted.fields.getTextInputValue("thumbnail").trim();
            const image = submitted.fields.getTextInputValue("image").trim();
            const thumbnailValidation = (0, validation_1.validateImageURL)(thumbnail);
            const imageValidation = (0, validation_1.validateImageURL)(image);
            if (!thumbnailValidation.valid) {
                await submitted.followUp({
                    content: `❌ Invalid thumbnail URL: ${thumbnailValidation.error}`,
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
                return;
            }
            if (!imageValidation.valid) {
                await submitted.followUp({
                    content: `❌ Invalid image URL: ${imageValidation.error}`,
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
                return;
            }
            session.embedData.thumbnail = thumbnail || undefined;
            session.embedData.image = image || undefined;
            resetSessionTimeout(sessionId);
            await updatePreview(sessionId);
        }
    }
}
async function handleFooterModal(interaction, sessionId) {
    const session = embedSessions.get(sessionId);
    if (!session)
        return;
    const { embedData } = session;
    const modal = new discord_js_1.ModalBuilder()
        .setCustomId(`eb_footer_modal_${sessionId}`)
        .setTitle((0, i18n_1.t)(interaction, "eb_modal_footer_title"));
    const textInput = new discord_js_1.TextInputBuilder()
        .setCustomId("text")
        .setLabel((0, i18n_1.t)(interaction, "eb_modal_footer_text_label"))
        .setStyle(discord_js_1.TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(2048)
        .setPlaceholder((0, i18n_1.t)(interaction, "eb_modal_footer_text_placeholder"));
    if (embedData.footerText)
        textInput.setValue(embedData.footerText);
    const iconInput = new discord_js_1.TextInputBuilder()
        .setCustomId("icon")
        .setLabel((0, i18n_1.t)(interaction, "eb_modal_footer_icon_label"))
        .setStyle(discord_js_1.TextInputStyle.Short)
        .setRequired(false)
        .setPlaceholder((0, i18n_1.t)(interaction, "eb_modal_footer_icon_placeholder"));
    if (embedData.footerIcon)
        iconInput.setValue(embedData.footerIcon);
    modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(textInput), new discord_js_1.ActionRowBuilder().addComponents(iconInput));
    await interaction.showModal(modal);
    const submitted = await interaction
        .awaitModalSubmit({
        time: 300000,
        filter: (i) => i.customId === `eb_footer_modal_${sessionId}`,
    })
        .catch(() => null);
    if (submitted) {
        await submitted.deferUpdate();
        const session = embedSessions.get(sessionId);
        if (session) {
            const text = submitted.fields.getTextInputValue("text").trim();
            const icon = submitted.fields.getTextInputValue("icon").trim();
            session.embedData.footerText = text || undefined;
            session.embedData.footerIcon = icon || undefined;
            resetSessionTimeout(sessionId);
            await updatePreview(sessionId);
        }
    }
}
async function handleFieldModal(interaction, sessionId) {
    const session = embedSessions.get(sessionId);
    if (!session)
        return;
    const { embedData } = session;
    if (embedData.fields.length >= 25) {
        await interaction.reply({
            content: `❌ ${(0, i18n_1.t)(interaction, "eb_field_max_reached")}`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const modal = new discord_js_1.ModalBuilder()
        .setCustomId(`eb_field_modal_${sessionId}`)
        .setTitle((0, i18n_1.t)(interaction, "eb_modal_field_title"));
    const nameInput = new discord_js_1.TextInputBuilder()
        .setCustomId("name")
        .setLabel((0, i18n_1.t)(interaction, "eb_modal_field_name_label"))
        .setStyle(discord_js_1.TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(256)
        .setPlaceholder((0, i18n_1.t)(interaction, "eb_modal_field_name_placeholder"));
    const valueInput = new discord_js_1.TextInputBuilder()
        .setCustomId("value")
        .setLabel((0, i18n_1.t)(interaction, "eb_modal_field_value_label"))
        .setStyle(discord_js_1.TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1024)
        .setPlaceholder((0, i18n_1.t)(interaction, "eb_modal_field_value_placeholder"));
    const inlineInput = new discord_js_1.TextInputBuilder()
        .setCustomId("inline")
        .setLabel((0, i18n_1.t)(interaction, "eb_modal_field_inline_label"))
        .setStyle(discord_js_1.TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(3)
        .setPlaceholder((0, i18n_1.t)(interaction, "eb_modal_field_inline_placeholder"))
        .setValue("yes");
    modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(nameInput), new discord_js_1.ActionRowBuilder().addComponents(valueInput), new discord_js_1.ActionRowBuilder().addComponents(inlineInput));
    await interaction.showModal(modal);
    const submitted = await interaction
        .awaitModalSubmit({
        time: 300000,
        filter: (i) => i.customId === `eb_field_modal_${sessionId}`,
    })
        .catch(() => null);
    if (submitted) {
        await submitted.deferUpdate();
        const session = embedSessions.get(sessionId);
        if (session) {
            const name = submitted.fields.getTextInputValue("name");
            const value = submitted.fields.getTextInputValue("value");
            const inlineStr = submitted.fields
                .getTextInputValue("inline")
                .toLowerCase();
            const inline = inlineStr === "yes" ||
                inlineStr === "y" ||
                inlineStr === "sim" ||
                inlineStr === "s" ||
                inlineStr === "true" ||
                inlineStr === "";
            session.embedData.fields.push({ name, value, inline });
            resetSessionTimeout(sessionId);
            await updatePreview(sessionId);
        }
    }
}
async function handleColorMenu(interaction, sessionId) {
    const selectMenu = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId(`eb_color_select_${sessionId}`)
        .setPlaceholder((0, i18n_1.t)(interaction, "eb_color_select_title"))
        .addOptions(Object.entries(COLOR_PRESETS).map(([key, preset]) => new discord_js_1.StringSelectMenuOptionBuilder()
        .setLabel(preset.name)
        .setValue(key)
        .setEmoji(preset.name.split(" ")[0])));
    const row = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
    await interaction.reply({
        content: `🎨 **${(0, i18n_1.t)(interaction, "eb_color_select_title")}**`,
        components: [row],
        flags: discord_js_1.MessageFlags.Ephemeral,
    });
    const collector = interaction.channel?.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.StringSelect,
        time: 60000,
        filter: (i) => i.user.id === interaction.user.id &&
            i.customId === `eb_color_select_${sessionId}`,
    });
    if (!collector)
        return;
    collector.on("collect", async (i) => {
        const colorKey = i.values[0];
        const session = embedSessions.get(sessionId);
        if (session) {
            session.embedData.color = COLOR_PRESETS[colorKey].hex;
            await i.update({
                content: `✅ ${(0, i18n_1.t)(i, "eb_color_set", { name: COLOR_PRESETS[colorKey].name })}`,
                components: [],
            });
            resetSessionTimeout(sessionId);
            await updatePreview(sessionId);
        }
        collector.stop();
    });
}
async function handleTemplateMenu(interaction, sessionId) {
    const selectMenu = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId(`eb_template_select_${sessionId}`)
        .setPlaceholder("📋 Choose a template to load")
        .addOptions(embedTemplates_1.EMBED_TEMPLATES.map((template) => new discord_js_1.StringSelectMenuOptionBuilder()
        .setLabel((0, embedTemplates_1.getTemplateName)(template, "pt-BR"))
        .setValue(template.id)
        .setDescription(template.description)
        .setEmoji(template.emoji)));
    const row = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
    await interaction.reply({
        content: `📋 **Escolha um Template**\n\nSelecione um template pré-definido para começar rapidamente. Você pode editar todos os campos depois.`,
        components: [row],
        flags: discord_js_1.MessageFlags.Ephemeral,
    });
    const collector = interaction.channel?.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.StringSelect,
        time: 60000,
        filter: (i) => i.user.id === interaction.user.id &&
            i.customId === `eb_template_select_${sessionId}`,
    });
    if (!collector)
        return;
    collector.on("collect", async (i) => {
        const templateId = i.values[0];
        const template = (0, embedTemplates_1.getTemplateById)(templateId);
        const session = embedSessions.get(sessionId);
        if (session && template) {
            session.embedData = {
                ...template.data,
                fields: [...template.data.fields],
            };
            await i.update({
                content: `✅ Template "${(0, embedTemplates_1.getTemplateName)(template, "pt-BR")}" carregado com sucesso! Verifique o preview acima.`,
                components: [],
            });
            resetSessionTimeout(sessionId);
            await updatePreview(sessionId);
        }
        collector.stop();
    });
}
async function handleManageFieldsMenu(interaction, sessionId) {
    const session = embedSessions.get(sessionId);
    if (!session)
        return;
    const { embedData } = session;
    if (embedData.fields.length === 0) {
        await interaction.reply({
            content: `ℹ️ Nenhum field foi adicionado ainda. Use o botão "➕ Add Field" para adicionar fields.`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const selectMenu = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId(`eb_fieldmanage_select_${sessionId}`)
        .setPlaceholder(`📝 Select a field to edit or remove (${embedData.fields.length} fields)`)
        .addOptions(embedData.fields.map((field, index) => new discord_js_1.StringSelectMenuOptionBuilder()
        .setLabel(`${index + 1}. ${field.name.substring(0, 80)}`)
        .setValue(String(index))
        .setDescription(`${field.value.substring(0, 80)} ${field.value.length > 80 ? "..." : ""}`)));
    const row = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
    await interaction.reply({
        content: `📝 **Gerenciar Fields**\n\nSelecione um field para editar ou remover:`,
        components: [row],
        flags: discord_js_1.MessageFlags.Ephemeral,
    });
    const collector = interaction.channel?.createMessageComponentCollector({
        componentType: discord_js_1.ComponentType.StringSelect,
        time: 60000,
        filter: (i) => i.user.id === interaction.user.id &&
            i.customId === `eb_fieldmanage_select_${sessionId}`,
    });
    if (!collector)
        return;
    collector.on("collect", async (i) => {
        const fieldIndex = parseInt(i.values[0]);
        const sess = embedSessions.get(sessionId);
        if (!sess) {
            collector.stop();
            return;
        }
        const field = sess.embedData.fields[fieldIndex];
        const editBtn = new discord_js_1.ButtonBuilder()
            .setCustomId(`eb_editfield_${sessionId}_${fieldIndex}`)
            .setLabel("✏️ Edit")
            .setStyle(discord_js_1.ButtonStyle.Primary);
        const removeBtn = new discord_js_1.ButtonBuilder()
            .setCustomId(`eb_removefield_${sessionId}_${fieldIndex}`)
            .setLabel("🗑️ Remove")
            .setStyle(discord_js_1.ButtonStyle.Danger);
        const cancelBtn = new discord_js_1.ButtonBuilder()
            .setCustomId(`eb_cancelfield_${sessionId}`)
            .setLabel("❌ Cancel")
            .setStyle(discord_js_1.ButtonStyle.Secondary);
        const actionRow = new discord_js_1.ActionRowBuilder().addComponents(editBtn, removeBtn, cancelBtn);
        await i.update({
            content: `**Field ${fieldIndex + 1}:**\n**Name:** ${field.name}\n**Value:** ${field.value}\n**Inline:** ${field.inline ? "Yes" : "No"}\n\nWhat would you like to do?`,
            components: [actionRow],
        });
        const btnCollector = i.message.createMessageComponentCollector({
            componentType: discord_js_1.ComponentType.Button,
            time: 60000,
            filter: (btnI) => btnI.user.id === i.user.id &&
                btnI.customId.startsWith(`eb_`) &&
                btnI.customId.includes(sessionId),
        });
        btnCollector.on("collect", async (btnI) => {
            const btnAction = btnI.customId.split("_")[1];
            if (btnAction === "editfield") {
                await handleEditField(btnI, sessionId, fieldIndex);
            }
            else if (btnAction === "removefield") {
                await handleRemoveField(btnI, sessionId, fieldIndex);
            }
            else if (btnAction === "cancelfield") {
                await btnI.update({
                    content: `❌ Cancelled field management.`,
                    components: [],
                });
            }
            btnCollector.stop();
            collector.stop();
        });
    });
}
async function handleEditField(interaction, sessionId, fieldIndex) {
    const session = embedSessions.get(sessionId);
    if (!session)
        return;
    const field = session.embedData.fields[fieldIndex];
    if (!field)
        return;
    const modal = new discord_js_1.ModalBuilder()
        .setCustomId(`eb_editfield_modal_${sessionId}_${fieldIndex}`)
        .setTitle(`Edit Field ${fieldIndex + 1}`);
    const nameInput = new discord_js_1.TextInputBuilder()
        .setCustomId("name")
        .setLabel("Field Name")
        .setStyle(discord_js_1.TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(256)
        .setValue(field.name);
    const valueInput = new discord_js_1.TextInputBuilder()
        .setCustomId("value")
        .setLabel("Field Value")
        .setStyle(discord_js_1.TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1024)
        .setValue(field.value);
    const inlineInput = new discord_js_1.TextInputBuilder()
        .setCustomId("inline")
        .setLabel("Inline? (yes/no)")
        .setStyle(discord_js_1.TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(3)
        .setValue(field.inline ? "yes" : "no");
    modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(nameInput), new discord_js_1.ActionRowBuilder().addComponents(valueInput), new discord_js_1.ActionRowBuilder().addComponents(inlineInput));
    await interaction.showModal(modal);
    const submitted = await interaction
        .awaitModalSubmit({
        time: 300000,
        filter: (i) => i.customId === `eb_editfield_modal_${sessionId}_${fieldIndex}`,
    })
        .catch(() => null);
    if (submitted) {
        const sess = embedSessions.get(sessionId);
        if (sess) {
            const name = submitted.fields.getTextInputValue("name");
            const value = submitted.fields.getTextInputValue("value");
            const inlineStr = submitted.fields
                .getTextInputValue("inline")
                .toLowerCase();
            const inline = inlineStr === "yes" ||
                inlineStr === "y" ||
                inlineStr === "sim" ||
                inlineStr === "s" ||
                inlineStr === "true";
            sess.embedData.fields[fieldIndex] = { name, value, inline };
            await submitted.reply({
                content: `✅ Field ${fieldIndex + 1} edited successfully!`,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            resetSessionTimeout(sessionId);
            await updatePreview(sessionId);
        }
    }
}
async function handleRemoveField(interaction, sessionId, fieldIndex) {
    const session = embedSessions.get(sessionId);
    if (!session)
        return;
    session.embedData.fields.splice(fieldIndex, 1);
    await interaction.update({
        content: `✅ Field ${fieldIndex + 1} removed successfully!`,
        components: [],
    });
    resetSessionTimeout(sessionId);
    await updatePreview(sessionId);
}
async function handleTimestamp(interaction, sessionId) {
    try {
        await interaction.deferUpdate();
        const session = embedSessions.get(sessionId);
        if (session) {
            session.embedData.timestamp = !session.embedData.timestamp;
            resetSessionTimeout(sessionId);
            await updatePreview(sessionId);
        }
    }
    catch (error) {
        console.error("Error in handleTimestamp:", error);
    }
}
async function handleClear(interaction, sessionId) {
    try {
        await interaction.deferUpdate();
        const session = embedSessions.get(sessionId);
        if (session) {
            session.embedData = {
                fields: [],
                timestamp: true,
                color: "#5865F2",
            };
            resetSessionTimeout(sessionId);
            await updatePreview(sessionId);
        }
    }
    catch (error) {
        console.error("Error in handleClear:", error);
    }
}
function normalizeEmbedJson(rawJson) {
    const normalized = {
        fields: [],
    };
    // Title
    if (rawJson.title) {
        normalized.title = rawJson.title;
    }
    // Description
    if (rawJson.description) {
        normalized.description = rawJson.description;
    }
    // URL
    if (rawJson.url) {
        normalized.url = rawJson.url;
    }
    // Color - convert from Discord number format to hex string
    if (rawJson.color !== undefined) {
        if (typeof rawJson.color === "number") {
            normalized.color = "#" + rawJson.color.toString(16).padStart(6, "0");
        }
        else if (typeof rawJson.color === "string") {
            normalized.color = rawJson.color;
        }
    }
    // Author - Discord format: {name, icon_url, url} -> Custom: {authorName, authorIcon, authorUrl}
    if (rawJson.author) {
        normalized.authorName = rawJson.author.name;
        normalized.authorIcon = rawJson.author.icon_url;
        normalized.authorUrl = rawJson.author.url;
    }
    // Custom format support
    if (rawJson.authorName)
        normalized.authorName = rawJson.authorName;
    if (rawJson.authorIcon)
        normalized.authorIcon = rawJson.authorIcon;
    if (rawJson.authorUrl)
        normalized.authorUrl = rawJson.authorUrl;
    // Thumbnail - Discord format: {url, width, height, ...} -> Custom: just url string
    if (rawJson.thumbnail) {
        if (typeof rawJson.thumbnail === "object" && rawJson.thumbnail.url) {
            normalized.thumbnail = rawJson.thumbnail.url;
        }
        else if (typeof rawJson.thumbnail === "string") {
            normalized.thumbnail = rawJson.thumbnail;
        }
    }
    // Image - Discord format: {url, width, height, ...} -> Custom: just url string
    if (rawJson.image) {
        if (typeof rawJson.image === "object" && rawJson.image.url) {
            normalized.image = rawJson.image.url;
        }
        else if (typeof rawJson.image === "string") {
            normalized.image = rawJson.image;
        }
    }
    // Footer - Discord format: {text, icon_url} -> Custom: {footerText, footerIcon}
    if (rawJson.footer) {
        normalized.footerText = rawJson.footer.text;
        normalized.footerIcon = rawJson.footer.icon_url;
    }
    // Custom format support
    if (rawJson.footerText)
        normalized.footerText = rawJson.footerText;
    if (rawJson.footerIcon)
        normalized.footerIcon = rawJson.footerIcon;
    // Timestamp
    if (rawJson.timestamp !== undefined) {
        if (typeof rawJson.timestamp === "boolean") {
            normalized.timestamp = rawJson.timestamp;
        }
        else if (typeof rawJson.timestamp === "string") {
            normalized.timestamp = true;
        }
    }
    // Fields - both formats should be compatible
    if (Array.isArray(rawJson.fields)) {
        normalized.fields = rawJson.fields.map((field) => ({
            name: field.name || "",
            value: field.value || "",
            inline: field.inline ?? false,
        }));
    }
    return normalized;
}
async function handleImportJson(interaction, sessionId) {
    const modal = new discord_js_1.ModalBuilder()
        .setCustomId(`eb_import_modal_${sessionId}`)
        .setTitle((0, i18n_1.t)(interaction, "eb_modal_import_title"));
    const jsonInput = new discord_js_1.TextInputBuilder()
        .setCustomId("json")
        .setLabel((0, i18n_1.t)(interaction, "eb_modal_import_label"))
        .setStyle(discord_js_1.TextInputStyle.Paragraph)
        .setRequired(true)
        .setPlaceholder((0, i18n_1.t)(interaction, "eb_modal_import_placeholder"));
    modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(jsonInput));
    await interaction.showModal(modal);
    const submitted = await interaction
        .awaitModalSubmit({
        time: 300000,
        filter: (i) => i.customId === `eb_import_modal_${sessionId}`,
    })
        .catch(() => null);
    if (submitted) {
        try {
            await submitted.deferUpdate();
            const session = embedSessions.get(sessionId);
            if (!session) {
                await submitted.followUp({
                    content: "❌ Session expired",
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
                return;
            }
            const jsonString = submitted.fields.getTextInputValue("json").trim();
            const parsed = JSON.parse(jsonString);
            // Convert Discord API format to custom format if needed
            const normalizedData = normalizeEmbedJson(parsed);
            // Update embed data
            session.embedData.title = normalizedData.title;
            session.embedData.description = normalizedData.description;
            session.embedData.color = normalizedData.color || "#5865F2";
            session.embedData.url = normalizedData.url;
            session.embedData.authorName = normalizedData.authorName;
            session.embedData.authorIcon = normalizedData.authorIcon;
            session.embedData.authorUrl = normalizedData.authorUrl;
            session.embedData.thumbnail = normalizedData.thumbnail;
            session.embedData.image = normalizedData.image;
            session.embedData.footerText = normalizedData.footerText;
            session.embedData.footerIcon = normalizedData.footerIcon;
            session.embedData.timestamp = normalizedData.timestamp ?? true;
            session.embedData.fields = normalizedData.fields || [];
            console.log("✅ JSON imported successfully, updating preview...");
            resetSessionTimeout(sessionId);
            // Update the preview
            await updatePreview(sessionId);
            // Send success feedback
            await submitted.followUp({
                content: `✅ ${(0, i18n_1.t)(submitted, "eb_import_success")}\n\n💡 **Dica:** Verifique o preview acima - ele foi atualizado com os dados importados!`,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
        }
        catch (error) {
            console.error("❌ Error importing JSON:", error);
            try {
                await submitted.followUp({
                    content: `❌ ${(0, i18n_1.t)(submitted, "eb_import_error", { error: error instanceof Error ? error.message : "Invalid JSON" })}`,
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
            }
            catch (followUpError) {
                console.error("Failed to send error feedback:", followUpError);
            }
        }
    }
}
async function handleExportJson(interaction, sessionId) {
    try {
        const session = embedSessions.get(sessionId);
        if (!session)
            return;
        const { embedData } = session;
        const jsonString = JSON.stringify(embedData, null, 2);
        resetSessionTimeout(sessionId);
        const codeBlock = `\`\`\`json\n${jsonString}\n\`\`\``;
        const fullMessage = `📤 **${(0, i18n_1.t)(interaction, "eb_export_title")}**\n${(0, i18n_1.t)(interaction, "eb_export_description")}\n\n${codeBlock}`;
        if (fullMessage.length > 2000) {
            const buffer = Buffer.from(jsonString, "utf-8");
            await interaction.reply({
                content: `📤 **${(0, i18n_1.t)(interaction, "eb_export_title")}**\n${(0, i18n_1.t)(interaction, "eb_export_description_file")}`,
                files: [
                    {
                        attachment: buffer,
                        name: "embed.json",
                    },
                ],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
        }
        else {
            await interaction.reply({
                content: fullMessage,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
        }
    }
    catch (error) {
        console.error("Error in handleExportJson:", error);
    }
}
async function handleSend(interaction, sessionId) {
    try {
        const session = embedSessions.get(sessionId);
        if (!session)
            return;
        const { embedData, channel, timeoutId, warningTimeoutId, collector } = session;
        if (!embedData.title &&
            !embedData.description &&
            embedData.fields.length === 0) {
            await interaction.reply({
                content: `❌ ${(0, i18n_1.t)(interaction, "eb_empty_embed")}`,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const finalEmbed = buildFinalEmbed(embedData);
        await channel.send({ embeds: [finalEmbed] });
        await interaction.update({
            content: `✅ ${(0, i18n_1.t)(interaction, "eb_sent_success", { channel: channel.toString() })}`,
            embeds: [finalEmbed],
            components: [],
        });
        if (timeoutId)
            clearTimeout(timeoutId);
        if (warningTimeoutId)
            clearTimeout(warningTimeoutId);
        if (collector)
            collector.stop();
        embedSessions.delete(sessionId);
    }
    catch (error) {
        console.error("Error in handleSend:", error);
        try {
            await interaction.reply({
                content: `❌ ${(0, i18n_1.t)(interaction, "eb_send_error", { error: error instanceof Error ? error.message : "Unknown" })}`,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
        }
        catch (replyError) {
            console.error("Failed to send error message:", replyError);
        }
    }
}
async function handleCancel(interaction, sessionId) {
    try {
        const session = embedSessions.get(sessionId);
        if (session) {
            if (session.timeoutId)
                clearTimeout(session.timeoutId);
            if (session.warningTimeoutId)
                clearTimeout(session.warningTimeoutId);
            if (session.collector)
                session.collector.stop();
        }
        embedSessions.delete(sessionId);
        await interaction.update({
            content: `❌ ${(0, i18n_1.t)(interaction, "eb_cancelled")}`,
            embeds: [],
            components: [],
        });
    }
    catch (error) {
        console.error("Error in handleCancel:", error);
    }
}
function buildPreviewEmbed(data, interaction) {
    const embed = new discord_js_1.EmbedBuilder();
    if (data.color) {
        embed.setColor(data.color);
    }
    if (data.title) {
        embed.setTitle(data.title);
    }
    else {
        embed.setTitle((0, i18n_1.t)(interaction, "eb_preview_title"));
    }
    if (data.description) {
        embed.setDescription(data.description);
    }
    if (data.url) {
        embed.setURL(data.url);
    }
    if (data.authorName) {
        embed.setAuthor({
            name: data.authorName,
            iconURL: data.authorIcon,
            url: data.authorUrl,
        });
    }
    if (data.thumbnail) {
        embed.setThumbnail(data.thumbnail);
    }
    if (data.image) {
        embed.setImage(data.image);
    }
    if (data.fields.length > 0) {
        embed.addFields(data.fields);
    }
    if (data.footerText) {
        embed.setFooter({
            text: data.footerText,
            iconURL: data.footerIcon,
        });
    }
    if (data.timestamp) {
        embed.setTimestamp();
    }
    return embed;
}
function buildFinalEmbed(data) {
    const embed = new discord_js_1.EmbedBuilder();
    if (data.color) {
        embed.setColor(data.color);
    }
    if (data.title) {
        embed.setTitle(data.title);
    }
    if (data.description) {
        embed.setDescription(data.description);
    }
    if (data.url) {
        embed.setURL(data.url);
    }
    if (data.authorName) {
        embed.setAuthor({
            name: data.authorName,
            iconURL: data.authorIcon,
            url: data.authorUrl,
        });
    }
    if (data.thumbnail) {
        embed.setThumbnail(data.thumbnail);
    }
    if (data.image) {
        embed.setImage(data.image);
    }
    if (data.fields.length > 0) {
        embed.addFields(data.fields);
    }
    if (data.footerText) {
        embed.setFooter({
            text: data.footerText,
            iconURL: data.footerIcon,
        });
    }
    if (data.timestamp) {
        embed.setTimestamp();
    }
    return embed;
}
//# sourceMappingURL=embedbuilder.js.map