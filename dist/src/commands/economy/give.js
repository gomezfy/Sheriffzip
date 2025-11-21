"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const embeds_1 = require("../../utils/embeds");
const i18n_1 = require("../../utils/i18n");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
const security_1 = require("../../utils/security");
const customEmojis_1 = require("../../utils/customEmojis");
const inventoryManager_1 = require("../../utils/inventoryManager");
const security_2 = require("../../utils/security");
exports.default = {
    data: (0, commandLocalizations_1.applyLocalizations)(new discord_js_1.SlashCommandBuilder()
        .setName("give")
        .setDescription("Transfer items or currency to another user")
        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1])
        .addUserOption((option) => option
        .setName("user")
        .setNameLocalizations({
        "pt-BR": "usuario",
        "es-ES": "usuario",
        fr: "utilisateur",
    })
        .setDescription("The user to give to")
        .setDescriptionLocalizations({
        "pt-BR": "O usuário para dar",
        "es-ES": "El usuario a quien dar",
        fr: "L'utilisateur à qui donner",
    })
        .setRequired(true))
        .addStringOption((option) => option
        .setName("item")
        .setNameLocalizations({
        "pt-BR": "item",
        "es-ES": "articulo",
        fr: "objet",
    })
        .setDescription("The item to give")
        .setDescriptionLocalizations({
        "pt-BR": "O item para dar",
        "es-ES": "El artículo a dar",
        fr: "L'objet à donner",
    })
        .setRequired(true)
        .addChoices({
        name: "🎫 Saloon Tokens",
        name_localizations: { "pt-BR": "🎫 Fichas do Saloon" },
        value: "saloon_token",
    }, {
        name: "🎟️ Seal",
        name_localizations: { "pt-BR": "🎟️ Selo" },
        value: "seal",
    }, {
        name: "🪙 Silver Coins",
        name_localizations: { "pt-BR": "🪙 Moedas de Prata" },
        value: "silver",
    }, {
        name: "🥇 Gold Bar",
        name_localizations: { "pt-BR": "🥇 Barra de Ouro" },
        value: "gold",
    }, {
        name: "💎 Diamond",
        name_localizations: { "pt-BR": "💎 Diamante" },
        value: "diamond",
    }, {
        name: "⛏️ Pickaxe",
        name_localizations: { "pt-BR": "⛏️ Picareta" },
        value: "pickaxe",
    }, {
        name: "🍯 Honey",
        name_localizations: { "pt-BR": "🍯 Mel" },
        value: "honey",
    }, {
        name: "🌾 Wheat",
        name_localizations: { "pt-BR": "🌾 Trigo" },
        value: "wheat",
    }, {
        name: "🐄 Cattle",
        name_localizations: { "pt-BR": "🐄 Gado" },
        value: "cattle",
    }))
        .addIntegerOption((option) => option
        .setName("amount")
        .setNameLocalizations({
        "pt-BR": "quantidade",
        "es-ES": "cantidad",
        fr: "quantité",
    })
        .setDescription("Amount to give")
        .setDescriptionLocalizations({
        "pt-BR": "Quantidade para dar",
        "es-ES": "Cantidad a dar",
        fr: "Quantité à donner",
    })
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(1000000000)), "give"),
    async execute(interaction) {
        const recipient = interaction.options.getUser("user", true);
        const itemId = interaction.options.getString("item", true);
        const amount = interaction.options.getInteger("amount", true);
        if (recipient.bot) {
            const embed = (0, embeds_1.errorEmbed)((0, i18n_1.t)(interaction, "give_invalid_recipient"), (0, i18n_1.t)(interaction, "give_cant_give_bots"), (0, i18n_1.t)(interaction, "give_choose_real_player"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        if (recipient.id === interaction.user.id) {
            const embed = (0, embeds_1.warningEmbed)((0, i18n_1.t)(interaction, "give_self_transfer"), (0, i18n_1.t)(interaction, "give_cant_give_self"), (0, i18n_1.t)(interaction, "give_mighty_strange"));
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        // Security: Validate amount is within safe limits
        if (!(0, security_2.isValidCurrencyAmount)(amount)) {
            const embed = (0, embeds_1.errorEmbed)("Invalid Amount", `The amount must be between 1 and ${security_2.MAX_CURRENCY_AMOUNT.toLocaleString()}.`, "Please try again with a valid amount.");
            await interaction.reply({
                embeds: [embed],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        await interaction.deferReply();
        // transferItem already uses transaction locks internally
        const result = await (0, inventoryManager_1.transferItem)(interaction.user.id, recipient.id, itemId, amount);
        if (!result.success) {
            const embed = (0, embeds_1.errorEmbed)((0, i18n_1.t)(interaction, "give_transfer_failed"), result.error, (0, i18n_1.t)(interaction, "give_check_inventory"));
            await interaction.editReply({ embeds: [embed] });
            return;
        }
        // Log high value transactions
        const type = itemId === "saloon_token"
            ? "token"
            : itemId === "silver"
                ? "silver"
                : "gold";
        security_1.securityLogger.logTransaction(interaction.user.id, type, amount, "transfer", recipient.id);
        const item = inventoryManager_1.ITEMS[itemId];
        // Usar emojis customizados
        let itemEmoji = "📦";
        if (itemId === "saloon_token") {
            itemEmoji = (0, customEmojis_1.getSaloonTokenEmoji)();
        }
        else if (itemId === "silver") {
            itemEmoji = (0, customEmojis_1.getSilverCoinEmoji)();
        }
        else if (itemId === "gold") {
            itemEmoji = (0, customEmojis_1.getGoldBarEmoji)();
        }
        else if (itemId === "diamond") {
            itemEmoji = (0, customEmojis_1.getDiamondEmoji)();
        }
        else if (itemId === "pickaxe") {
            itemEmoji = (0, customEmojis_1.getPickaxeEmoji)();
        }
        else {
            itemEmoji = item?.emoji || "📦";
        }
        const itemName = item?.name || itemId;
        let amountDisplay = "";
        if (itemId === "saloon_token") {
            amountDisplay = (0, embeds_1.formatCurrency)(amount, "tokens");
        }
        else if (itemId === "silver") {
            amountDisplay = (0, embeds_1.formatCurrency)(amount, "silver");
        }
        else {
            amountDisplay = `${itemEmoji} **${amount.toLocaleString()} ${itemName}**`;
        }
        const giftEmoji = (0, customEmojis_1.getGiftEmoji)();
        const embed = (0, embeds_1.successEmbed)(`${giftEmoji} ${(0, i18n_1.t)(interaction, "give_transfer_success")}`, (0, i18n_1.t)(interaction, "give_you_gave", {
            amount: amountDisplay,
            user: recipient.tag,
        }))
            .addFields({
            name: (0, i18n_1.t)(interaction, "give_from"),
            value: interaction.user.tag,
            inline: true,
        }, { name: (0, i18n_1.t)(interaction, "give_to"), value: recipient.tag, inline: true }, {
            name: (0, i18n_1.t)(interaction, "give_item"),
            value: `${itemEmoji} ${itemName}`,
            inline: true,
        }, {
            name: (0, i18n_1.t)(interaction, "give_quantity"),
            value: amount.toLocaleString(),
            inline: true,
        })
            .setFooter({ text: `${giftEmoji} ${(0, i18n_1.t)(interaction, "give_generosity")}` });
        await interaction.editReply({ embeds: [embed] });
    },
};
//# sourceMappingURL=give.js.map