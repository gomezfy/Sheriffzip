"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dataManager_1 = require("../../utils/dataManager");
const welcomeEmbedBuilder_1 = require("../../utils/welcomeEmbedBuilder");
const i18n_1 = require("../../utils/i18n");
/**
 * Professional Welcome System Command
 * Minimalist interface with import/export functionality and automatic translations (PT-BR and EN-US)
 */
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("welcome")
        .setDescription("🤠 Professional welcome message system")
        .setDescriptionLocalizations({
        "pt-BR": "🤠 Sistema profissional de mensagens de boas-vindas",
    })
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (!interaction.guild) {
            await interaction.reply({
                content: "❌ This command can only be used in a server!",
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const locale = (0, i18n_1.getLocale)(interaction);
        const config = (0, dataManager_1.getWelcomeConfig)(interaction.guild.id);
        // Create main control panel
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(config?.enabled ? 0x57f287 : 0x5865f2)
            .setTitle((0, i18n_1.t)(interaction, "welcome_panel_title"))
            .setDescription((0, i18n_1.t)(interaction, "welcome_panel_description"))
            .addFields({
            name: (0, i18n_1.t)(interaction, "welcome_status_field"),
            value: config?.enabled
                ? `✅ ${(0, i18n_1.t)(interaction, "welcome_status_enabled")}`
                : `❌ ${(0, i18n_1.t)(interaction, "welcome_status_disabled")}`,
            inline: true,
        }, {
            name: (0, i18n_1.t)(interaction, "welcome_channel_field"),
            value: config?.channelId
                ? `<#${config.channelId}>`
                : (0, i18n_1.t)(interaction, "welcome_not_set"),
            inline: true,
        })
            .setFooter({ text: (0, i18n_1.t)(interaction, "welcome_panel_footer") })
            .setTimestamp();
        // Create buttons
        const row1 = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId("welcome_configure")
            .setLabel((0, i18n_1.t)(interaction, "welcome_btn_configure"))
            .setEmoji("⚙️")
            .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
            .setCustomId("welcome_view")
            .setLabel((0, i18n_1.t)(interaction, "welcome_btn_view"))
            .setEmoji("👁️")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setDisabled(!config), new discord_js_1.ButtonBuilder()
            .setCustomId("welcome_toggle")
            .setLabel(config?.enabled
            ? (0, i18n_1.t)(interaction, "welcome_btn_disable")
            : (0, i18n_1.t)(interaction, "welcome_btn_enable"))
            .setEmoji(config?.enabled ? "❌" : "✅")
            .setStyle(config?.enabled ? discord_js_1.ButtonStyle.Danger : discord_js_1.ButtonStyle.Success)
            .setDisabled(!config));
        const row2 = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId("welcome_test")
            .setLabel((0, i18n_1.t)(interaction, "welcome_btn_test"))
            .setEmoji("🧪")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setDisabled(!config?.enabled), new discord_js_1.ButtonBuilder()
            .setCustomId("welcome_import")
            .setLabel((0, i18n_1.t)(interaction, "welcome_btn_import"))
            .setEmoji("📥")
            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
            .setCustomId("welcome_export")
            .setLabel((0, i18n_1.t)(interaction, "welcome_btn_export"))
            .setEmoji("📤")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setDisabled(!config));
        const response = await interaction.reply({
            embeds: [embed],
            components: [row1, row2],
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        // Button collector
        const collector = response.createMessageComponentCollector({
            componentType: discord_js_1.ComponentType.Button,
            time: 600_000, // 10 minutes
        });
        collector.on("collect", async (i) => {
            if (i.user.id !== interaction.user.id) {
                await i.reply({
                    content: (0, i18n_1.t)(interaction, "welcome_error_not_your_panel"),
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
                return;
            }
            try {
                switch (i.customId) {
                    case "welcome_configure":
                        await handleConfigure(i);
                        break;
                    case "welcome_view":
                        await handleView(i);
                        break;
                    case "welcome_toggle":
                        await handleToggle(i);
                        break;
                    case "welcome_test":
                        await handleTest(i);
                        break;
                    case "welcome_import":
                        await handleImport(i);
                        break;
                    case "welcome_export":
                        await handleExport(i);
                        break;
                }
            }
            catch (error) {
                console.error("Welcome button error:", error);
                await i.reply({
                    content: (0, i18n_1.t)(interaction, "welcome_error_generic"),
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
            }
        });
        collector.on("end", async () => {
            try {
                await interaction.editReply({ components: [] });
            }
            catch (error) {
                // Message might have been deleted
            }
        });
    },
};
/**
 * Handle configuration modal
 */
async function handleConfigure(interaction) {
    const modal = new discord_js_1.ModalBuilder()
        .setCustomId("welcome_config_modal")
        .setTitle((0, i18n_1.t)(interaction, "welcome_modal_title"));
    const currentConfig = (0, dataManager_1.getWelcomeConfig)(interaction.guild.id);
    const channelInput = new discord_js_1.TextInputBuilder()
        .setCustomId("channel_id")
        .setLabel((0, i18n_1.t)(interaction, "welcome_modal_channel_label"))
        .setPlaceholder((0, i18n_1.t)(interaction, "welcome_modal_channel_placeholder"))
        .setStyle(discord_js_1.TextInputStyle.Short)
        .setRequired(true)
        .setValue(currentConfig?.channelId || "");
    const messageInput = new discord_js_1.TextInputBuilder()
        .setCustomId("message")
        .setLabel((0, i18n_1.t)(interaction, "welcome_modal_message_label"))
        .setPlaceholder((0, i18n_1.t)(interaction, "welcome_modal_message_placeholder"))
        .setStyle(discord_js_1.TextInputStyle.Paragraph)
        .setRequired(true)
        .setValue(currentConfig?.message ||
        '{\n  "title": "🤠 Welcome!",\n  "description": "Welcome {@user} to **{server}**!\\n\\nYou are member **#{guild.size}**!",\n  "color": 5865242,\n  "thumbnail": "{user.avatar}",\n  "footer": {"text": "Enjoy the server!", "icon_url": "{guild.icon}"}\n}');
    const imageInput = new discord_js_1.TextInputBuilder()
        .setCustomId("image")
        .setLabel((0, i18n_1.t)(interaction, "welcome_modal_image_label"))
        .setPlaceholder((0, i18n_1.t)(interaction, "welcome_modal_image_placeholder"))
        .setStyle(discord_js_1.TextInputStyle.Short)
        .setRequired(false)
        .setValue(currentConfig?.image || "");
    modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(channelInput), new discord_js_1.ActionRowBuilder().addComponents(messageInput), new discord_js_1.ActionRowBuilder().addComponents(imageInput));
    await interaction.showModal(modal);
    // Wait for modal submission
    try {
        const submitted = await interaction.awaitModalSubmit({
            time: 300_000, // 5 minutes
            filter: (i) => i.customId === "welcome_config_modal" &&
                i.user.id === interaction.user.id,
        });
        const channelId = submitted.fields.getTextInputValue("channel_id").trim();
        const message = submitted.fields.getTextInputValue("message").trim();
        const image = submitted.fields.getTextInputValue("image").trim() || null;
        // Validate channel
        const channel = await interaction.guild.channels
            .fetch(channelId)
            .catch(() => null);
        if (!channel || channel.type !== discord_js_1.ChannelType.GuildText) {
            await submitted.reply({
                content: `❌ ${(0, i18n_1.t)(interaction, "welcome_error_invalid_channel")}`,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        // Validate JSON if provided
        if (message.startsWith("{")) {
            try {
                JSON.parse(message);
            }
            catch {
                await submitted.reply({
                    content: `❌ ${(0, i18n_1.t)(interaction, "welcome_error_invalid_json")}`,
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
                return;
            }
        }
        // Validate image URL if provided
        if (image && !isValidUrl(image)) {
            await submitted.reply({
                content: `❌ ${(0, i18n_1.t)(interaction, "welcome_error_invalid_url")}`,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        // Save configuration
        const config = {
            channelId,
            message,
            image,
            enabled: true,
            updatedAt: Date.now(),
        };
        (0, dataManager_1.setWelcomeConfig)(interaction.guild.id, config);
        const successEmbed = new discord_js_1.EmbedBuilder()
            .setColor(0x57f287)
            .setTitle(`✅ ${(0, i18n_1.t)(interaction, "welcome_config_saved")}`)
            .setDescription((0, i18n_1.t)(interaction, "welcome_config_saved_desc"))
            .addFields({
            name: `📢 ${(0, i18n_1.t)(interaction, "welcome_channel_field")}`,
            value: `<#${channelId}>`,
            inline: true,
        }, {
            name: `📝 ${(0, i18n_1.t)(interaction, "welcome_message_field")}`,
            value: message.length > 100 ? message.substring(0, 100) + "..." : message,
            inline: false,
        })
            .setTimestamp();
        if (image) {
            successEmbed.addFields({
                name: "🖼️ " + (0, i18n_1.t)(interaction, "welcome_image_field"),
                value: `[${(0, i18n_1.t)(interaction, "welcome_view_image")}](${image})`,
                inline: true,
            });
        }
        await submitted.reply({
            embeds: [successEmbed],
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        // Update original panel
        await updatePanel(interaction);
    }
    catch (error) {
        // Modal timed out or was cancelled
    }
}
/**
 * Handle view configuration
 */
async function handleView(interaction) {
    const config = (0, dataManager_1.getWelcomeConfig)(interaction.guild.id);
    if (!config) {
        await interaction.reply({
            content: `❌ ${(0, i18n_1.t)(interaction, "welcome_not_configured")}`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle((0, i18n_1.t)(interaction, "welcome_current_config"))
        .addFields({
        name: `📊 ${(0, i18n_1.t)(interaction, "welcome_status_field")}`,
        value: config.enabled
            ? `✅ ${(0, i18n_1.t)(interaction, "welcome_status_enabled")}`
            : `❌ ${(0, i18n_1.t)(interaction, "welcome_status_disabled")}`,
        inline: true,
    }, {
        name: `📢 ${(0, i18n_1.t)(interaction, "welcome_channel_field")}`,
        value: `<#${config.channelId}>`,
        inline: true,
    }, {
        name: `📝 ${(0, i18n_1.t)(interaction, "welcome_message_field")}`,
        value: "```json\n" +
            (config.message.length > 500
                ? config.message.substring(0, 500) + "..."
                : config.message) +
            "\n```",
        inline: false,
    }, {
        name: `📋 ${(0, i18n_1.t)(interaction, "welcome_placeholders_field")}`,
        value: (0, i18n_1.t)(interaction, "welcome_placeholders_list"),
        inline: false,
    })
        .setFooter({ text: (0, i18n_1.t)(interaction, "welcome_view_footer") })
        .setTimestamp(config.updatedAt);
    if (config.image) {
        embed.addFields({
            name: "🖼️ " + (0, i18n_1.t)(interaction, "welcome_image_field"),
            value: `[${(0, i18n_1.t)(interaction, "welcome_view_image")}](${config.image})`,
            inline: true,
        });
        embed.setThumbnail(config.image);
    }
    await interaction.reply({ embeds: [embed], flags: discord_js_1.MessageFlags.Ephemeral });
}
/**
 * Handle toggle enable/disable
 */
async function handleToggle(interaction) {
    const config = (0, dataManager_1.getWelcomeConfig)(interaction.guild.id);
    if (!config) {
        await interaction.reply({
            content: `❌ ${(0, i18n_1.t)(interaction, "welcome_not_configured")}`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    config.enabled = !config.enabled;
    config.updatedAt = Date.now();
    (0, dataManager_1.setWelcomeConfig)(interaction.guild.id, config);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(config.enabled ? 0x57f287 : 0xed4245)
        .setTitle(config.enabled
        ? `✅ ${(0, i18n_1.t)(interaction, "welcome_enabled_title")}`
        : `❌ ${(0, i18n_1.t)(interaction, "welcome_disabled_title")}`)
        .setDescription(config.enabled
        ? (0, i18n_1.t)(interaction, "welcome_enabled_desc")
        : (0, i18n_1.t)(interaction, "welcome_disabled_desc"))
        .setTimestamp();
    await interaction.reply({ embeds: [embed], flags: discord_js_1.MessageFlags.Ephemeral });
    // Update original panel
    await updatePanel(interaction);
}
/**
 * Handle test message
 */
async function handleTest(interaction) {
    const config = (0, dataManager_1.getWelcomeConfig)(interaction.guild.id);
    if (!config || !config.enabled) {
        await interaction.reply({
            content: `❌ ${(0, i18n_1.t)(interaction, "welcome_test_error_disabled")}`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const channel = await interaction.guild.channels
        .fetch(config.channelId)
        .catch(() => null);
    if (!channel || !("send" in channel)) {
        await interaction.reply({
            content: `❌ ${(0, i18n_1.t)(interaction, "welcome_error_channel_not_found")}`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    try {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        const messagePayload = (0, welcomeEmbedBuilder_1.buildWelcomeEmbed)(config, member);
        await channel.send(messagePayload);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0x57f287)
            .setTitle(`✅ ${(0, i18n_1.t)(interaction, "welcome_test_sent")}`)
            .setDescription(`${(0, i18n_1.t)(interaction, "welcome_test_sent_desc")} <#${channel.id}>`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed], flags: discord_js_1.MessageFlags.Ephemeral });
    }
    catch (error) {
        console.error("Test welcome error:", error);
        await interaction.reply({
            content: `❌ ${(0, i18n_1.t)(interaction, "welcome_test_error")}`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
    }
}
/**
 * Handle import configuration
 */
async function handleImport(interaction) {
    const modal = new discord_js_1.ModalBuilder()
        .setCustomId("welcome_import_modal")
        .setTitle((0, i18n_1.t)(interaction, "welcome_import_title"));
    const jsonInput = new discord_js_1.TextInputBuilder()
        .setCustomId("json_config")
        .setLabel((0, i18n_1.t)(interaction, "welcome_import_label"))
        .setPlaceholder((0, i18n_1.t)(interaction, "welcome_import_placeholder"))
        .setStyle(discord_js_1.TextInputStyle.Paragraph)
        .setRequired(true);
    modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(jsonInput));
    await interaction.showModal(modal);
    try {
        const submitted = await interaction.awaitModalSubmit({
            time: 300_000,
            filter: (i) => i.customId === "welcome_import_modal" &&
                i.user.id === interaction.user.id,
        });
        const jsonConfig = submitted.fields.getTextInputValue("json_config").trim();
        let config;
        try {
            config = JSON.parse(jsonConfig);
        }
        catch {
            await submitted.reply({
                content: `❌ ${(0, i18n_1.t)(interaction, "welcome_error_invalid_json")}`,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        // Validate required fields
        if (!config.channelId || !config.message) {
            await submitted.reply({
                content: `❌ ${(0, i18n_1.t)(interaction, "welcome_import_error_missing")}`,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        // Validate channel exists
        const channel = await interaction.guild.channels
            .fetch(config.channelId)
            .catch(() => null);
        if (!channel || channel.type !== discord_js_1.ChannelType.GuildText) {
            await submitted.reply({
                content: `❌ ${(0, i18n_1.t)(interaction, "welcome_error_invalid_channel")}`,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        config.enabled = config.enabled !== false;
        config.updatedAt = Date.now();
        (0, dataManager_1.setWelcomeConfig)(interaction.guild.id, config);
        const successEmbed = new discord_js_1.EmbedBuilder()
            .setColor(0x57f287)
            .setTitle(`✅ ${(0, i18n_1.t)(interaction, "welcome_import_success")}`)
            .setDescription((0, i18n_1.t)(interaction, "welcome_import_success_desc"))
            .addFields({
            name: `📢 ${(0, i18n_1.t)(interaction, "welcome_channel_field")}`,
            value: `<#${config.channelId}>`,
            inline: true,
        })
            .setTimestamp();
        await submitted.reply({
            embeds: [successEmbed],
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        await updatePanel(interaction);
    }
    catch (error) {
        // Modal timed out
    }
}
/**
 * Handle export configuration
 */
async function handleExport(interaction) {
    const config = (0, dataManager_1.getWelcomeConfig)(interaction.guild.id);
    if (!config) {
        await interaction.reply({
            content: `❌ ${(0, i18n_1.t)(interaction, "welcome_not_configured")}`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const jsonString = JSON.stringify(config, null, 2);
    const buffer = Buffer.from(jsonString, "utf-8");
    const attachment = new discord_js_1.AttachmentBuilder(buffer, {
        name: `welcome-config-${interaction.guild.id}.json`,
    });
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`📤 ${(0, i18n_1.t)(interaction, "welcome_export_title")}`)
        .setDescription((0, i18n_1.t)(interaction, "welcome_export_desc"))
        .setTimestamp();
    await interaction.reply({
        embeds: [embed],
        files: [attachment],
        flags: discord_js_1.MessageFlags.Ephemeral,
    });
}
/**
 * Update main panel
 */
async function updatePanel(interaction) {
    try {
        const config = (0, dataManager_1.getWelcomeConfig)(interaction.guild.id);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(config?.enabled ? 0x57f287 : 0x5865f2)
            .setTitle((0, i18n_1.t)(interaction, "welcome_panel_title"))
            .setDescription((0, i18n_1.t)(interaction, "welcome_panel_description"))
            .addFields({
            name: (0, i18n_1.t)(interaction, "welcome_status_field"),
            value: config?.enabled
                ? `✅ ${(0, i18n_1.t)(interaction, "welcome_status_enabled")}`
                : `❌ ${(0, i18n_1.t)(interaction, "welcome_status_disabled")}`,
            inline: true,
        }, {
            name: (0, i18n_1.t)(interaction, "welcome_channel_field"),
            value: config?.channelId
                ? `<#${config.channelId}>`
                : (0, i18n_1.t)(interaction, "welcome_not_set"),
            inline: true,
        })
            .setFooter({ text: (0, i18n_1.t)(interaction, "welcome_panel_footer") })
            .setTimestamp();
        const row1 = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId("welcome_configure")
            .setLabel((0, i18n_1.t)(interaction, "welcome_btn_configure"))
            .setEmoji("⚙️")
            .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
            .setCustomId("welcome_view")
            .setLabel((0, i18n_1.t)(interaction, "welcome_btn_view"))
            .setEmoji("👁️")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setDisabled(!config), new discord_js_1.ButtonBuilder()
            .setCustomId("welcome_toggle")
            .setLabel(config?.enabled
            ? (0, i18n_1.t)(interaction, "welcome_btn_disable")
            : (0, i18n_1.t)(interaction, "welcome_btn_enable"))
            .setEmoji(config?.enabled ? "❌" : "✅")
            .setStyle(config?.enabled ? discord_js_1.ButtonStyle.Danger : discord_js_1.ButtonStyle.Success)
            .setDisabled(!config));
        const row2 = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId("welcome_test")
            .setLabel((0, i18n_1.t)(interaction, "welcome_btn_test"))
            .setEmoji("🧪")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setDisabled(!config?.enabled), new discord_js_1.ButtonBuilder()
            .setCustomId("welcome_import")
            .setLabel((0, i18n_1.t)(interaction, "welcome_btn_import"))
            .setEmoji("📥")
            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
            .setCustomId("welcome_export")
            .setLabel((0, i18n_1.t)(interaction, "welcome_btn_export"))
            .setEmoji("📤")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setDisabled(!config));
        // Get the original message
        const originalMessage = await interaction.message.fetch();
        await originalMessage.edit({ embeds: [embed], components: [row1, row2] });
    }
    catch (error) {
        // Could not update panel
        console.error("Failed to update welcome panel:", error);
    }
}
/**
 * Validate URL
 */
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=welcome.js.map