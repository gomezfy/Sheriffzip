import {
  StringSelectMenuInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { getItem, removeItem, addItem } from "../../../utils/inventoryManager";
import { depositSilver, withdrawSilver } from "../../../utils/bankManager";
import { getEmoji } from "../../../utils/customEmojis";
import { MEAT_ITEMS, PELT_ITEMS, FISH_ITEMS, SPECIAL_ITEMS, SUPPLY_ITEMS } from "../../../commands/hunting/hunterstore";

export async function handleHunterStoreMenu(
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

  const selectedValue = interaction.values[0];
  const category = selectedValue.split('_')[1];

  let items: any[] = [];
  let categoryTitle = "";
  let categoryDescription = "";

  switch (category) {
    case "meat":
      items = MEAT_ITEMS;
      categoryTitle = "🥩 Vender Carnes";
      categoryDescription = "Selecione a carne que deseja vender:";
      break;
    case "pelt":
      items = PELT_ITEMS;
      categoryTitle = `${getEmoji("deer_pelt")} Vender Peles`;
      categoryDescription = "Selecione a pele que deseja vender:";
      break;
    case "fish":
      items = FISH_ITEMS;
      categoryTitle = `${getEmoji("catfish")} Vender Peixes`;
      categoryDescription = "Selecione o peixe que deseja vender:";
      break;
    case "special":
      items = SPECIAL_ITEMS;
      categoryTitle = `${getEmoji("eagle_feather")} Vender Penas`;
      categoryDescription = "Selecione a pena que deseja vender:";
      break;
    case "supply":
      items = SUPPLY_ITEMS;
      categoryTitle = `${getEmoji("basic_bait")} Comprar Suprimentos`;
      categoryDescription = "Selecione o item que deseja comprar:";
      break;
  }

  const categoryEmbed = new EmbedBuilder()
    .setColor("#d4af37")
    .setTitle(categoryTitle)
    .setDescription(
      categoryDescription +
      "\n\n" +
      items
        .map(
          (item) =>
            `${item.emoji} **${item.name}**\n` +
            `├ Preço: ${getEmoji("coin")} ${item.price.toLocaleString()} moedas\n` +
            `├ Raridade: \`${item.rarity}\`\n` +
            `└ ${category === "supply" ? "Disponível para compra" : `Você possui: **${getItem(userId, item.id)}x**`}`
        )
        .join("\n\n")
    )
    .setFooter({ text: "Selecione um item abaixo" })
    .setTimestamp();

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(category === "supply" ? `hunterstore_buy_${userId}` : `hunterstore_sell_${userId}`)
    .setPlaceholder(`Selecione um item para ${category === "supply" ? "comprar" : "vender"}`);

  items.forEach((item) => {
    selectMenu.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(item.name)
        .setDescription(`${item.rarity} - ${getEmoji("coin")} ${item.price.toLocaleString()} moedas`)
        .setValue(item.id)
        .setEmoji(item.emoji)
    );
  });

  const backButton = new ButtonBuilder()
    .setCustomId(`hunterstore_back_${userId}`)
    .setLabel("Voltar")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("◀️");

  const row1 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(backButton);

  await interaction.editReply({
    embeds: [categoryEmbed],
    components: [row1, row2],
  });
}

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
  
  const allItems = [...MEAT_ITEMS, ...PELT_ITEMS, ...FISH_ITEMS, ...SPECIAL_ITEMS];
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

export async function handleHunterStoreBuy(
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
  
  const selectedItem = SUPPLY_ITEMS.find((item) => item.id === itemId);

  if (!selectedItem) {
    await interaction.editReply({
      content: "❌ Item não encontrado!",
      components: [],
    });
    return;
  }

  const confirmEmbed = new EmbedBuilder()
    .setColor("#d4af37")
    .setTitle(`${getEmoji("shop")} Confirmar Compra`)
    .setDescription(
      `Você está prestes a comprar:\n\n` +
      `${selectedItem.emoji} **${selectedItem.name}**\n` +
      `└ Preço: ${getEmoji("coin")} **${selectedItem.price.toLocaleString()}** moedas de prata\n\n` +
      `Deseja confirmar a compra?`
    )
    .setFooter({ text: "Esta ação não pode ser desfeita!" })
    .setTimestamp();

  const confirmButton = new ButtonBuilder()
    .setCustomId(`hunterstore_confirm_buy_${itemId}_${userId}`)
    .setLabel("Confirmar Compra")
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
