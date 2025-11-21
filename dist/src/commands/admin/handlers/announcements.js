"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAnnouncementSend = handleAnnouncementSend;
exports.handleAnnouncementTemplate = handleAnnouncementTemplate;
exports.handleAnnouncementHistory = handleAnnouncementHistory;
const discord_js_1 = require("discord.js");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const i18n_1 = require("../../../utils/i18n");
const ANNOUNCEMENT_DATA_PATH = path.join(__dirname, "../../../data/announcements.json");
function loadAnnouncementData() {
    try {
        if (!fs.existsSync(ANNOUNCEMENT_DATA_PATH)) {
            const defaultData = { templates: {}, history: [] };
            fs.writeFileSync(ANNOUNCEMENT_DATA_PATH, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
        return JSON.parse(fs.readFileSync(ANNOUNCEMENT_DATA_PATH, "utf-8"));
    }
    catch (error) {
        return { templates: {}, history: [] };
    }
}
function saveAnnouncementData(data) {
    fs.writeFileSync(ANNOUNCEMENT_DATA_PATH, JSON.stringify(data, null, 2));
}
function addToAnnouncementHistory(guildId, channelId, authorId, authorTag, title) {
    const data = loadAnnouncementData();
    data.history.unshift({
        id: Date.now().toString(),
        guildId,
        channelId,
        authorId,
        authorTag,
        title,
        timestamp: Date.now(),
    });
    const guildHistory = data.history.filter((h) => h.guildId === guildId);
    const otherHistory = data.history.filter((h) => h.guildId !== guildId);
    data.history = [...guildHistory.slice(0, 100), ...otherHistory];
    saveAnnouncementData(data);
}
const COLOR_PRESETS = {
    gold: { name: "🟡 Gold Rush", hex: "#FFD700" },
    red: { name: "🔴 Wanted Poster", hex: "#DC143C" },
    green: { name: "🟢 Sheriff Badge", hex: "#2ECC71" },
    blue: { name: "🔵 Saloon Night", hex: "#3498DB" },
    purple: { name: "🟣 Royal Purple", hex: "#9B59B6" },
    orange: { name: "🟠 Desert Sunset", hex: "#E67E22" },
    brown: { name: "🟤 Western Leather", hex: "#8B4513" },
    silver: { name: "⚪ Silver Coin", hex: "#C0C0C0" },
};
// =============== ANNOUNCEMENT HANDLERS ===============
async function handleAnnouncementSend(interaction) {
    const channel = interaction.options.getChannel("channel", true);
    const title = interaction.options.getString("title", true);
    let message = interaction.options.getString("message", true);
    const colorPreset = interaction.options.getString("color_preset") || "gold";
    const thumbnail = interaction.options.getString("thumbnail");
    const image = interaction.options.getString("image");
    const mentionRole = interaction.options.getRole("mention_role");
    const mentionEveryone = interaction.options.getBoolean("mention_everyone") || false;
    const mentionHere = interaction.options.getBoolean("mention_here") || false;
    const customFooter = interaction.options.getString("footer");
    message = message.replace(/\\n/g, "\n");
    if (!channel || !("send" in channel)) {
        await interaction.reply({
            content: `❌ The channel must be a text channel!`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    if (mentionEveryone || mentionHere) {
        if (!interaction.memberPermissions?.has(discord_js_1.PermissionFlagsBits.MentionEveryone)) {
            await interaction.reply({
                content: `❌ You need the "Mention Everyone" permission to use @everyone or @here mentions!`,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
    }
    const colorHex = COLOR_PRESETS[colorPreset]?.hex || "#FFD700";
    const color = parseInt(colorHex.replace("#", ""), 16);
    const previewEmbed = new discord_js_1.EmbedBuilder()
        .setColor(color)
        .setTitle(`📢 ${title}`)
        .setDescription(message)
        .addFields([
        {
            name: `📝 ${(0, i18n_1.t)(interaction, "announce_author")}`,
            value: `${interaction.user}`,
            inline: true,
        },
        {
            name: `📺 ${(0, i18n_1.t)(interaction, "announce_channel")}`,
            value: `${channel}`,
            inline: true,
        },
    ])
        .setTimestamp();
    if (thumbnail)
        previewEmbed.setThumbnail(thumbnail);
    if (image)
        previewEmbed.setImage(image);
    const footerText = customFooter ||
        `${(0, i18n_1.t)(interaction, "announce_author")}: ${interaction.user.tag}`;
    previewEmbed.setFooter({
        text: footerText,
        iconURL: interaction.user.displayAvatarURL(),
    });
    let mentionText = "";
    if (mentionEveryone)
        mentionText = "@everyone ";
    else if (mentionHere)
        mentionText = "@here ";
    else if (mentionRole)
        mentionText = `${mentionRole} `;
    const confirmRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId("confirm_announcement")
        .setLabel(`✅ ${(0, i18n_1.t)(interaction, "announce_confirm")}`)
        .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
        .setCustomId("cancel_announcement")
        .setLabel(`❌ ${(0, i18n_1.t)(interaction, "announce_cancel")}`)
        .setStyle(discord_js_1.ButtonStyle.Danger));
    const previewMessage = await interaction.reply({
        content: `**📋 ${(0, i18n_1.t)(interaction, "announce_preview")}**\n${mentionText ? `**Mentions:** ${mentionText}` : ""}`,
        embeds: [previewEmbed],
        components: [confirmRow],
        flags: discord_js_1.MessageFlags.Ephemeral,
    });
    try {
        const buttonInteraction = await previewMessage.awaitMessageComponent({
            componentType: discord_js_1.ComponentType.Button,
            time: 60000,
        });
        if (buttonInteraction.customId === "confirm_announcement") {
            const finalEmbed = new discord_js_1.EmbedBuilder()
                .setColor(color)
                .setTitle(`📢 ${title}`)
                .setDescription(message)
                .setFooter({ text: footerText })
                .setTimestamp();
            if (thumbnail)
                finalEmbed.setThumbnail(thumbnail);
            if (image)
                finalEmbed.setImage(image);
            const sendOptions = { embeds: [finalEmbed] };
            if (mentionText) {
                sendOptions.content = mentionText.trim();
                if (mentionEveryone || mentionHere) {
                    sendOptions.allowedMentions = { parse: ["everyone"] };
                }
            }
            await channel.send(sendOptions);
            addToAnnouncementHistory(interaction.guildId, channel.id, interaction.user.id, interaction.user.tag, title);
            const successEmbed = new discord_js_1.EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle(`✅ ${(0, i18n_1.t)(interaction, "announce_success")}`)
                .setDescription(`${(0, i18n_1.t)(interaction, "announce_sent_to")} ${channel}`)
                .addFields([
                {
                    name: `📝 ${(0, i18n_1.t)(interaction, "announce_author")}`,
                    value: `${interaction.user}`,
                    inline: true,
                },
                {
                    name: `📺 ${(0, i18n_1.t)(interaction, "announce_channel")}`,
                    value: `${channel}`,
                    inline: true,
                },
            ])
                .setTimestamp()
                .setFooter({
                text: (0, i18n_1.t)(interaction, "announce_title"),
                iconURL: interaction.user.displayAvatarURL(),
            });
            await buttonInteraction.update({
                content: "",
                embeds: [successEmbed],
                components: [],
            });
        }
        else {
            const cancelEmbed = new discord_js_1.EmbedBuilder()
                .setColor(0xff0000)
                .setTitle(`❌ ${(0, i18n_1.t)(interaction, "announce_cancel")}`)
                .setDescription("The announcement was not sent.")
                .setTimestamp();
            await buttonInteraction.update({
                content: "",
                embeds: [cancelEmbed],
                components: [],
            });
        }
    }
    catch (error) {
        await interaction.editReply({
            content: "⏱️ Announcement preview expired. Please try again.",
            embeds: [],
            components: [],
        });
    }
}
async function handleAnnouncementTemplate(interaction) {
    const action = interaction.options.getString("action", true);
    const name = interaction.options.getString("name");
    if (name &&
        (name === "__proto__" || name === "constructor" || name === "prototype")) {
        await interaction.reply({
            content: "❌ Invalid template name.",
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const channel = interaction.options.getChannel("channel");
    const data = loadAnnouncementData();
    if (action === "create") {
        if (!name) {
            await interaction.reply({
                content: "❌ Please provide a template name!",
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        if (data.templates[name]) {
            await interaction.reply({
                content: `❌ A template named "${name}" already exists! Use a different name or delete the existing one first.`,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const exampleTemplate = {
            name: name,
            title: "Your Title Here",
            message: "Your message here\nSupports multiple lines",
            color: "#FFD700",
            thumbnail: undefined,
            image: undefined,
            footer: `Template: ${name}`,
        };
        data.templates[name] = exampleTemplate;
        saveAnnouncementData(data);
        await interaction.reply({
            content: `✅ **Template "${name}" created!**\n\nUse \`/admin announcement template action:edit name:${name} ...\` to modify it.`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    if (action === "edit") {
        const field = interaction.options.getString("edit_field");
        const value = interaction.options.getString("new_value");
        if (!name || !field || value === null) {
            await interaction.reply({
                content: "❌ For editing, you must provide the template name, the field to edit, and the new value!",
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        if (!data.templates[name]) {
            await interaction.reply({
                content: `❌ Template "${name}" not found!`,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        data.templates[name][field] = value;
        saveAnnouncementData(data);
        await interaction.reply({
            content: `✅ Template "${name}" updated! Field \`${field}\` is now set to \`${value}\`.`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    if (action === "list") {
        const templates = Object.values(data.templates);
        if (templates.length === 0) {
            await interaction.reply({
                content: "📝 No templates saved yet.",
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setColor("#FFD700")
            .setTitle("📝 Saved Announcement Templates")
            .setDescription(templates.map((t) => `**${t.name}**\n└ ${t.title}`).join("\n\n"))
            .setFooter({ text: `Total: ${templates.length} templates` })
            .setTimestamp();
        await interaction.reply({ embeds: [embed], flags: discord_js_1.MessageFlags.Ephemeral });
        return;
    }
    if (action === "use") {
        if (!name || !channel) {
            await interaction.reply({
                content: "❌ Please provide both template name and channel!",
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const template = data.templates[name];
        if (!template) {
            await interaction.reply({
                content: `❌ Template "${name}" not found!`,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const color = parseInt(template.color.replace("#", ""), 16);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(color)
            .setTitle(`📢 ${template.title}`)
            .setDescription(template.message)
            .setFooter({
            text: template.footer || `Announced by ${interaction.user.tag}`,
        })
            .setTimestamp();
        if (template.thumbnail)
            embed.setThumbnail(template.thumbnail);
        if (template.image)
            embed.setImage(template.image);
        if (!("send" in channel)) {
            await interaction.reply({
                content: "❌ The channel must be a text channel!",
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        await channel.send({ embeds: [embed] });
        addToAnnouncementHistory(interaction.guildId, channel.id, interaction.user.id, interaction.user.tag, template.title);
        await interaction.reply({
            content: `✅ Template "${name}" sent to ${channel}!`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    if (action === "delete") {
        if (!name) {
            await interaction.reply({
                content: "❌ Please provide a template name!",
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        if (!data.templates[name]) {
            await interaction.reply({
                content: `❌ Template "${name}" not found!`,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        delete data.templates[name];
        saveAnnouncementData(data);
        await interaction.reply({
            content: `✅ Template "${name}" deleted!`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
    }
}
async function handleAnnouncementHistory(interaction) {
    const limit = interaction.options.getInteger("limit") || 10;
    const data = loadAnnouncementData();
    const guildHistory = data.history.filter((h) => h.guildId === interaction.guildId);
    if (guildHistory.length === 0) {
        await interaction.reply({
            content: "📜 No announcement history found for this server.",
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const entries = guildHistory.slice(0, limit);
    const embed = new discord_js_1.EmbedBuilder()
        .setColor("#FFD700")
        .setTitle("📜 Announcement History")
        .setDescription(entries
        .map((entry, i) => {
        const date = new Date(entry.timestamp);
        return `**${i + 1}.** ${entry.title}\n└ By ${entry.authorTag} in <#${entry.channelId}>\n└ <t:${Math.floor(entry.timestamp / 1000)}:R>`;
    })
        .join("\n\n"))
        .setFooter({
        text: `Showing ${entries.length} of ${guildHistory.length} announcements`,
    })
        .setTimestamp();
    await interaction.reply({ embeds: [embed], flags: discord_js_1.MessageFlags.Ephemeral });
}
//# sourceMappingURL=announcements.js.map