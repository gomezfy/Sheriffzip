import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import {
  successEmbed,
  errorEmbed,
  warningEmbed,
  formatCurrency,
} from "../../utils/embeds";
import { t } from "../../utils/i18n";
import { applyLocalizations } from "../../utils/commandLocalizations";
import { securityLogger } from "../../utils/security";
import {
  getSaloonTokenEmoji,
  getSilverCoinEmoji,
  getGoldBarEmoji,
  getGiftEmoji,
  getDiamondEmoji,
  getPickaxeEmoji,
} from "../../utils/customEmojis";
import { transferItem, ITEMS } from "../../utils/inventoryManager";
import { isValidCurrencyAmount, MAX_CURRENCY_AMOUNT } from "../../utils/security";

export default {
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName("give")
      .setDescription("Transfer items or currency to another user")
      .setContexts([0, 1, 2])
      .setIntegrationTypes([0, 1])
      .addUserOption((option) =>
        option
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
          .setRequired(true),
      )
      .addStringOption((option) =>
        option
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
          .addChoices(
            {
              name: "🎫 Saloon Tokens",
              name_localizations: { "pt-BR": "🎫 Fichas do Saloon" },
              value: "saloon_token",
            },
            {
              name: "🎟️ Seal",
              name_localizations: { "pt-BR": "🎟️ Selo" },
              value: "seal",
            },
            {
              name: "🪙 Silver Coins",
              name_localizations: { "pt-BR": "🪙 Moedas de Prata" },
              value: "silver",
            },
            {
              name: "🥇 Gold Bar",
              name_localizations: { "pt-BR": "🥇 Barra de Ouro" },
              value: "gold",
            },
            {
              name: "💎 Diamond",
              name_localizations: { "pt-BR": "💎 Diamante" },
              value: "diamond",
            },
            {
              name: "⛏️ Pickaxe",
              name_localizations: { "pt-BR": "⛏️ Picareta" },
              value: "pickaxe",
            },
            {
              name: "🍯 Honey",
              name_localizations: { "pt-BR": "🍯 Mel" },
              value: "honey",
            },
            {
              name: "🌾 Wheat",
              name_localizations: { "pt-BR": "🌾 Trigo" },
              value: "wheat",
            },
            {
              name: "🐄 Cattle",
              name_localizations: { "pt-BR": "🐄 Gado" },
              value: "cattle",
            },
          ),
      )
      .addIntegerOption((option) =>
        option
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
          .setMaxValue(1000000000),
      ),
    "give",
  ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const recipient = interaction.options.getUser("user", true);
    const itemId = interaction.options.getString("item", true);
    const amount = interaction.options.getInteger("amount", true);

    if (recipient.bot) {
      const embed = errorEmbed(
        t(interaction, "give_invalid_recipient"),
        t(interaction, "give_cant_give_bots"),
        t(interaction, "give_choose_real_player"),
      );

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (recipient.id === interaction.user.id) {
      const embed = warningEmbed(
        t(interaction, "give_self_transfer"),
        t(interaction, "give_cant_give_self"),
        t(interaction, "give_mighty_strange"),
      );

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Security: Validate amount is within safe limits
    if (!isValidCurrencyAmount(amount)) {
      const embed = errorEmbed(
        "Invalid Amount",
        `The amount must be between 1 and ${MAX_CURRENCY_AMOUNT.toLocaleString()}.`,
        "Please try again with a valid amount.",
      );

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();

    // transferItem already uses transaction locks internally
    const result = await transferItem(interaction.user.id, recipient.id, itemId, amount);

    if (!result.success) {
      const embed = errorEmbed(
        t(interaction, "give_transfer_failed"),
        result.error,
        t(interaction, "give_check_inventory"),
      );

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // Log high value transactions
    const type =
      itemId === "saloon_token"
        ? "token"
        : itemId === "silver"
          ? "silver"
          : "gold";
    securityLogger.logTransaction(
      interaction.user.id,
      type as "silver" | "gold" | "token",
      amount,
      "transfer",
      recipient.id,
    );

    const item = ITEMS[itemId];

    // Usar emojis customizados
    let itemEmoji = "📦";
    if (itemId === "saloon_token") {
      itemEmoji = getSaloonTokenEmoji();
    } else if (itemId === "silver") {
      itemEmoji = getSilverCoinEmoji();
    } else if (itemId === "gold") {
      itemEmoji = getGoldBarEmoji();
    } else if (itemId === "diamond") {
      itemEmoji = getDiamondEmoji();
    } else if (itemId === "pickaxe") {
      itemEmoji = getPickaxeEmoji();
    } else {
      itemEmoji = item?.emoji || "📦";
    }

    const itemName = item?.name || itemId;

    let amountDisplay = "";
    if (itemId === "saloon_token") {
      amountDisplay = formatCurrency(amount, "tokens");
    } else if (itemId === "silver") {
      amountDisplay = formatCurrency(amount, "silver");
    } else {
      amountDisplay = `${itemEmoji} **${amount.toLocaleString()} ${itemName}**`;
    }

    const giftEmoji = getGiftEmoji();
    const embed = successEmbed(
      `${giftEmoji} ${t(interaction, "give_transfer_success")}`,
      t(interaction, "give_you_gave", {
        amount: amountDisplay,
        user: recipient.tag,
      }),
    )
      .addFields(
        {
          name: t(interaction, "give_from"),
          value: interaction.user.tag,
          inline: true,
        },
        { name: t(interaction, "give_to"), value: recipient.tag, inline: true },
        {
          name: t(interaction, "give_item"),
          value: `${itemEmoji} ${itemName}`,
          inline: true,
        },
        {
          name: t(interaction, "give_quantity"),
          value: amount.toLocaleString(),
          inline: true,
        },
      )
      .setFooter({ text: `${giftEmoji} ${t(interaction, "give_generosity")}` });

    await interaction.editReply({ embeds: [embed] });
  },
};
