import {
  StringSelectMenuInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { getItem, removeItem } from "../../../utils/inventoryManager";
import { depositSilver } from "../../../utils/bankManager";
import { getEmoji } from "../../../utils/customEmojis";
import { MEAT_ITEMS, PELT_ITEMS, SPECIAL_ITEMS } from "../../../commands/hunting/hunterstore";

export async function handleHunterStoreSell(
  interaction: StringSelectMenuInteraction,
): Promise<void> {
  const userId = interaction.user.id;

  if (!interaction.customId.endsWith(userId)) {
    await interaction.reply({
      content: "❌ Este menu não é para você!",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferUpdate();

  const itemId = interaction.values[0];
  
  const allItems = [...MEAT_ITEMS, ...PELT_ITEMS, ...SPECIAL_ITEMS];
  const selectedItem = allItems.find((item) => item.id === itemId);

  if (!selectedItem) {
    await interaction.editReply({
      content: "❌ Item não encontrado!",
      components: [],
    });
    return;
  }

  const quantity = getItem(userId, itemId);

  if (quantity === 0) {
    await interaction.editReply({
      content: "❌ Você não possui este item!",
      components: [],
    });
    return;
  }

  const confirmEmbed = new EmbedBuilder()
    .setColor("#d4af37")
    .setTitle(`${getEmoji("shop")} Confirmar Venda`)
    .setDescription(
      `Você está prestes a vender:\n\n` +
      `${selectedItem.emoji} **${selectedItem.name}**\n` +
      `├ Quantidade: **${quantity}x**\n` +
      `├ Preço unitário: ${getEmoji("coin")} **${selectedItem.price.toLocaleString()}** moedas\n` +
      `└ Valor total: ${getEmoji("coin")} **${(quantity * selectedItem.price).toLocaleString()}** moedas de prata\n\n` +
      `Deseja confirmar a venda de **TODOS** os itens?`
    )
    .setFooter({ text: "Esta ação não pode ser desfeita!" })
    .setTimestamp();

  const confirmButton = new ButtonBuilder()
    .setCustomId(`hunterstore_confirm_${itemId}_${userId}`)
    .setLabel("Confirmar Venda")
    .setStyle(ButtonStyle.Success)
    .setEmoji("✅");

  const cancelButton = new ButtonBuilder()
    .setCustomId(`hunterstore_back_${userId}`)
    .setLabel("Cancelar")
    .setStyle(ButtonStyle.Danger)
    .setEmoji("❌");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    confirmButton,
    cancelButton,
  );

  await interaction.editReply({
    embeds: [confirmEmbed],
    components: [row],
  });
}
