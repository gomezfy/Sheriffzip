import {
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  APIMessageComponentEmoji,
} from "discord.js";
import { getItem, removeItem, addItem } from "../../../utils/inventoryManager";
import { depositSilver, withdrawSilver, getBankAccount } from "../../../utils/bankManager";
import { getEmoji } from "../../../utils/customEmojis";
import { warningEmbed } from "../../../utils/embeds";
import { MEAT_ITEMS, PELT_ITEMS, FISH_ITEMS, SPECIAL_ITEMS, SUPPLY_ITEMS } from "../../../commands/hunting/hunterstore";

function parseCustomEmoji(emojiString: string): APIMessageComponentEmoji | string {
  const customEmojiRegex = /<a?:(\w+):(\d+)>/;
  const match = emojiString.match(customEmojiRegex);
  
  if (match) {
    return {
      id: match[2],
      name: match[1],
    };
  }
  
  return emojiString;
}

export async function handleHunterStoreMeat(
  interaction: ButtonInteraction,
): Promise<void> {
  const userId = interaction.user.id;

  if (!interaction.customId.endsWith(userId)) {
    await interaction.reply({
      content: "❌ Este botão não é para você!",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferUpdate();

  const itemsList = MEAT_ITEMS.map((item) => {
    const quantity = getItem(userId, item.id);
    const totalValue = quantity * item.price;
    return {
      ...item,
      quantity,
      totalValue,
    };
  });

  const hasAnyMeat = itemsList.some((item) => item.quantity > 0);

  const meatEmbed = new EmbedBuilder()
    .setColor("#d4af37")
    .setTitle(`🥩 Hunter's Store - Carnes`)
    .setDescription(
      `Preços de compra para **carnes de caça**:\n\n` +
      itemsList
        .map(
          (item) =>
            `${item.emoji} **${item.name}** (${item.rarity})\n` +
            `├ Preço: ${getEmoji("coin")} **${item.price.toLocaleString()}** moedas/unidade\n` +
            `└ Você tem: **${item.quantity}x** ${item.quantity > 0 ? `(Total: ${getEmoji("coin")} ${item.totalValue.toLocaleString()})` : ""}\n`,
        )
        .join("\n") +
      `\n${hasAnyMeat ? "Selecione o que deseja vender:" : "❌ Você não possui carnes para vender!"}`
    )
    .setFooter({ text: "Venda suas carnes por moedas de prata!" })
    .setTimestamp();

  if (!hasAnyMeat) {
    const backButton = new ButtonBuilder()
      .setCustomId(`hunterstore_back_${userId}`)
      .setLabel("Voltar")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("◀️");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(backButton);

    await interaction.editReply({
      embeds: [meatEmbed],
      components: [row],
    });
    return;
  }

  const options = itemsList
    .filter((item) => item.quantity > 0)
    .map((item) => ({
      label: `${item.name} (${item.quantity}x)`,
      description: `Vender por ${item.price} moedas cada | Total: ${item.totalValue.toLocaleString()} moedas`,
      value: item.id,
      emoji: parseCustomEmoji(item.emoji),
    }));

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`hunterstore_sell_${userId}`)
    .setPlaceholder("Escolha um item para vender...")
    .addOptions(options);

  const backButton = new ButtonBuilder()
    .setCustomId(`hunterstore_back_${userId}`)
    .setLabel("Voltar")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("◀️");

  const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
  const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(backButton);

  await interaction.editReply({
    embeds: [meatEmbed],
    components: [selectRow, buttonRow],
  });
}

export async function handleHunterStorePelt(
  interaction: ButtonInteraction,
): Promise<void> {
  const userId = interaction.user.id;

  if (!interaction.customId.endsWith(userId)) {
    await interaction.reply({
      content: "❌ Este botão não é para você!",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferUpdate();

  const itemsList = PELT_ITEMS.map((item) => {
    const quantity = getItem(userId, item.id);
    const totalValue = quantity * item.price;
    return {
      ...item,
      quantity,
      totalValue,
    };
  });

  const hasAnyPelt = itemsList.some((item) => item.quantity > 0);

  const peltEmbed = new EmbedBuilder()
    .setColor("#d4af37")
    .setTitle(`${getEmoji("deer_pelt")} Hunter's Store - Peles`)
    .setDescription(
      `Preços de compra para **peles de caça**:\n\n` +
      itemsList
        .map(
          (item) =>
            `${item.emoji} **${item.name}** (${item.rarity})\n` +
            `├ Preço: ${getEmoji("coin")} **${item.price.toLocaleString()}** moedas/unidade\n` +
            `└ Você tem: **${item.quantity}x** ${item.quantity > 0 ? `(Total: ${getEmoji("coin")} ${item.totalValue.toLocaleString()})` : ""}\n`,
        )
        .join("\n") +
      `\n${hasAnyPelt ? "Selecione o que deseja vender:" : "❌ Você não possui peles para vender!"}`
    )
    .setFooter({ text: "Venda suas peles por moedas de prata!" })
    .setTimestamp();

  if (!hasAnyPelt) {
    const backButton = new ButtonBuilder()
      .setCustomId(`hunterstore_back_${userId}`)
      .setLabel("Voltar")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("◀️");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(backButton);

    await interaction.editReply({
      embeds: [peltEmbed],
      components: [row],
    });
    return;
  }

  const options = itemsList
    .filter((item) => item.quantity > 0)
    .map((item) => ({
      label: `${item.name} (${item.quantity}x)`,
      description: `Vender por ${item.price} moedas cada | Total: ${item.totalValue.toLocaleString()} moedas`,
      value: item.id,
      emoji: parseCustomEmoji(item.emoji),
    }));

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`hunterstore_sell_${userId}`)
    .setPlaceholder("Escolha um item para vender...")
    .addOptions(options);

  const backButton = new ButtonBuilder()
    .setCustomId(`hunterstore_back_${userId}`)
    .setLabel("Voltar")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("◀️");

  const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
  const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(backButton);

  await interaction.editReply({
    embeds: [peltEmbed],
    components: [selectRow, buttonRow],
  });
}

export async function handleHunterStoreFish(
  interaction: ButtonInteraction,
): Promise<void> {
  const userId = interaction.user.id;

  if (!interaction.customId.endsWith(userId)) {
    await interaction.reply({
      content: "❌ Este botão não é para você!",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferUpdate();

  const itemsList = FISH_ITEMS.map((item) => {
    const quantity = getItem(userId, item.id);
    const totalValue = quantity * item.price;
    return {
      ...item,
      quantity,
      totalValue,
    };
  });

  const hasAnyFish = itemsList.some((item) => item.quantity > 0);

  const fishEmbed = new EmbedBuilder()
    .setColor("#d4af37")
    .setTitle(`🐟 Hunter's Store - Peixes`)
    .setDescription(
      `Preços de compra para **peixes frescos**:\n\n` +
      itemsList
        .map(
          (item) =>
            `${item.emoji} **${item.name}** (${item.rarity})\n` +
            `├ Preço: ${getEmoji("coin")} **${item.price.toLocaleString()}** moedas/unidade\n` +
            `└ Você tem: **${item.quantity}x** ${item.quantity > 0 ? `(Total: ${getEmoji("coin")} ${item.totalValue.toLocaleString()})` : ""}\n`,
        )
        .join("\n") +
      `\n${hasAnyFish ? "Selecione o que deseja vender:" : "❌ Você não possui peixes para vender!"}`
    )
    .setFooter({ text: "Venda seus peixes por moedas de prata!" })
    .setTimestamp();

  if (!hasAnyFish) {
    const backButton = new ButtonBuilder()
      .setCustomId(`hunterstore_back_${userId}`)
      .setLabel("Voltar")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("◀️");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(backButton);

    await interaction.editReply({
      embeds: [fishEmbed],
      components: [row],
    });
    return;
  }

  const options = itemsList
    .filter((item) => item.quantity > 0)
    .map((item) => ({
      label: `${item.name} (${item.quantity}x)`,
      description: `Vender por ${item.price} moedas cada | Total: ${item.totalValue.toLocaleString()} moedas`,
      value: item.id,
      emoji: parseCustomEmoji(item.emoji),
    }));

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`hunterstore_sell_${userId}`)
    .setPlaceholder("Escolha um item para vender...")
    .addOptions(options);

  const backButton = new ButtonBuilder()
    .setCustomId(`hunterstore_back_${userId}`)
    .setLabel("Voltar")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("◀️");

  const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
  const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(backButton);

  await interaction.editReply({
    embeds: [fishEmbed],
    components: [selectRow, buttonRow],
  });
}

export async function handleHunterStoreSpecial(
  interaction: ButtonInteraction,
): Promise<void> {
  const userId = interaction.user.id;

  if (!interaction.customId.endsWith(userId)) {
    await interaction.reply({
      content: "❌ Este botão não é para você!",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferUpdate();

  const itemsList = SPECIAL_ITEMS.map((item) => {
    const quantity = getItem(userId, item.id);
    const totalValue = quantity * item.price;
    return {
      ...item,
      quantity,
      totalValue,
    };
  });

  const hasAnySpecial = itemsList.some((item) => item.quantity > 0);

  const specialEmbed = new EmbedBuilder()
    .setColor("#d4af37")
    .setTitle(`🪶 Hunter's Store - Penas Raras`)
    .setDescription(
      `Preços de compra para **itens especiais**:\n\n` +
      itemsList
        .map(
          (item) =>
            `${item.emoji} **${item.name}** (${item.rarity})\n` +
            `├ Preço: ${getEmoji("coin")} **${item.price.toLocaleString()}** moedas/unidade\n` +
            `└ Você tem: **${item.quantity}x** ${item.quantity > 0 ? `(Total: ${getEmoji("coin")} ${item.totalValue.toLocaleString()})` : ""}\n`,
        )
        .join("\n") +
      `\n${hasAnySpecial ? "Selecione o que deseja vender:" : "❌ Você não possui penas raras para vender!"}`
    )
    .setFooter({ text: "Venda suas penas raras por moedas de prata!" })
    .setTimestamp();

  if (!hasAnySpecial) {
    const backButton = new ButtonBuilder()
      .setCustomId(`hunterstore_back_${userId}`)
      .setLabel("Voltar")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("◀️");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(backButton);

    await interaction.editReply({
      embeds: [specialEmbed],
      components: [row],
    });
    return;
  }

  const options = itemsList
    .filter((item) => item.quantity > 0)
    .map((item) => ({
      label: `${item.name} (${item.quantity}x)`,
      description: `Vender por ${item.price} moedas cada | Total: ${item.totalValue.toLocaleString()} moedas`,
      value: item.id,
      emoji: parseCustomEmoji(item.emoji),
    }));

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`hunterstore_sell_${userId}`)
    .setPlaceholder("Escolha um item para vender...")
    .addOptions(options);

  const backButton = new ButtonBuilder()
    .setCustomId(`hunterstore_back_${userId}`)
    .setLabel("Voltar")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("◀️");

  const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
  const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(backButton);

  await interaction.editReply({
    embeds: [specialEmbed],
    components: [selectRow, buttonRow],
  });
}

export async function handleHunterStoreBack(
  interaction: ButtonInteraction,
): Promise<void> {
  const userId = interaction.user.id;

  if (!interaction.customId.endsWith(userId)) {
    await interaction.reply({
      content: "❌ Este botão não é para você!",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferUpdate();

  const mainEmbed = new EmbedBuilder()
    .setColor("#d4af37")
    .setTitle(`${getEmoji("shop")} Hunter's Store - Loja do Caçador`)
    .setDescription(
      `Bem-vindo à **Hunter's Store**, ${interaction.user.username}!\n\n` +
      `Compramos suas carnes, peles e peixes pelos melhores preços do velho oeste!\n` +
      `Também vendemos suprimentos essenciais para caça e pesca!\n\n` +
      `${getEmoji("gift")} **Vendemos (você vende para nós):**\n` +
      `🍖 **Carnes** - De coelho a urso\n` +
      `${getEmoji("rabbit_pelt")} **Peles** - Valiosas peles de animais\n` +
      `${getEmoji("catfish")} **Peixes** - Do bagre ao peixe mítico\n` +
      `${getEmoji("eagle_feather")} **Penas Raras** - Penas de águia dourada\n\n` +
      `${getEmoji("shop")} **Compramos (você compra de nós):**\n` +
      `${getEmoji("basic_bait")} **Suprimentos** - Iscas para pesca\n\n` +
      `${getEmoji("coin")} Todos os pagamentos são feitos em **moedas de prata**!\n\n` +
      `Selecione uma categoria abaixo:`
    )
    .setImage("https://i.postimg.cc/BQ11FPd3/IMG-3478.png")
    .setFooter({ text: "Escolha uma categoria" })
    .setTimestamp();

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`hunterstore_menu_${userId}`)
    .setPlaceholder("Selecione uma categoria")
    .addOptions(
      {
        label: "Vender Carnes",
        description: "Venda suas carnes de caça por moedas de prata",
        value: `hunterstore_meat_${userId}`,
        emoji: "🥩",
      },
      {
        label: "Vender Peles",
        description: "Venda peles valiosas de animais",
        value: `hunterstore_pelt_${userId}`,
        emoji: parseCustomEmoji(getEmoji("deer_pelt")),
      },
      {
        label: "Vender Peixes",
        description: "Venda seus peixes capturados",
        value: `hunterstore_fish_${userId}`,
        emoji: parseCustomEmoji(getEmoji("catfish")),
      },
      {
        label: "Vender Penas",
        description: "Venda penas raras de águia",
        value: `hunterstore_special_${userId}`,
        emoji: parseCustomEmoji(getEmoji("eagle_feather")),
      },
      {
        label: "Comprar Suprimentos",
        description: "Compre iscas para pesca",
        value: `hunterstore_supply_${userId}`,
        emoji: parseCustomEmoji(getEmoji("basic_bait")),
      },
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    selectMenu,
  );

  await interaction.editReply({
    embeds: [mainEmbed],
    components: [row],
  });
}

export async function handleHunterStoreConfirm(
  interaction: ButtonInteraction,
): Promise<void> {
  const customIdParts = interaction.customId.split("_");
  const userId = customIdParts[customIdParts.length - 1];
  
  const isBuy = customIdParts.includes("buy");
  const itemId = isBuy
    ? customIdParts.slice(3, customIdParts.length - 1).join("_")
    : customIdParts.slice(2, customIdParts.length - 1).join("_");

  if (interaction.user.id !== userId) {
    await interaction.reply({
      content: "❌ Este botão não é para você!",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferUpdate();

  if (isBuy) {
    const selectedItem = SUPPLY_ITEMS.find((item) => item.id === itemId);

    if (!selectedItem) {
      await interaction.editReply({
        content: "❌ Item não encontrado!",
        components: [],
      });
      return;
    }

    const userSilver = getItem(userId, "silver");

    if (userSilver < selectedItem.price) {
      const noMoneyEmbed = warningEmbed(
        "❌ Moedas Insuficientes",
        `Você não tem moedas suficientes para comprar **${selectedItem.name}**!\n\n` +
        `Custo: ${getEmoji("coin")} **${selectedItem.price.toLocaleString()}** moedas\n` +
        `Seu saldo: ${getEmoji("coin")} **${userSilver.toLocaleString()}** moedas\n` +
        `Faltam: ${getEmoji("coin")} **${(selectedItem.price - userSilver).toLocaleString()}** moedas`,
        "Venda itens para conseguir mais moedas!",
      );

      await interaction.editReply({
        embeds: [noMoneyEmbed],
        components: [],
      });
      return;
    }

    await removeItem(userId, "silver", selectedItem.price);
    await addItem(userId, itemId, 1);

    const successEmbed = new EmbedBuilder()
      .setColor("#10b981")
      .setTitle(`${getEmoji("check")} Compra Realizada com Sucesso!`)
      .setDescription(
        `Você comprou na **Hunter's Store**!\n\n` +
        `${selectedItem.emoji} **${selectedItem.name}**\n` +
        `├ Quantidade: **1x**\n` +
        `└ Preço: ${getEmoji("coin")} **${selectedItem.price.toLocaleString()}** moedas de prata\n\n` +
        `${getEmoji("coin")} Saldo restante: **${(userSilver - selectedItem.price).toLocaleString()}** moedas\n\n` +
        `🎣 Use \`/fish\` para pescar!`
      )
      .setFooter({ text: "Hunter's Store - Suprimentos de qualidade!" })
      .setTimestamp();

    const backButton = new ButtonBuilder()
      .setCustomId(`hunterstore_back_${userId}`)
      .setLabel("Voltar ao Menu")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🏪");

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(backButton);

    await interaction.editReply({
      embeds: [successEmbed],
      components: [row],
    });
    return;
  }

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
    const noItemEmbed = warningEmbed(
      "❌ Item Não Encontrado",
      `Você não possui **${selectedItem.name}** no inventário!`,
      "Vá caçar para obter mais itens",
    );
    await interaction.editReply({
      embeds: [noItemEmbed],
      components: [],
    });
    return;
  }

  const totalValue = quantity * selectedItem.price;

  await removeItem(userId, itemId, quantity);
  await depositSilver(userId, totalValue);

  const successEmbed = new EmbedBuilder()
    .setColor("#10b981")
    .setTitle(`${getEmoji("check")} Venda Realizada com Sucesso!`)
    .setDescription(
      `Você vendeu seus itens para a **Hunter's Store**!\n\n` +
      `${selectedItem.emoji} **${selectedItem.name}**\n` +
      `├ Quantidade vendida: **${quantity}x**\n` +
      `├ Preço unitário: ${getEmoji("coin")} **${selectedItem.price.toLocaleString()}** moedas\n` +
      `└ Total recebido: ${getEmoji("coin")} **${totalValue.toLocaleString()}** moedas de prata\n\n` +
      `${getEmoji("coin")} As moedas foram adicionadas à sua conta!\n\n` +
      `Obrigado por negociar conosco, parceiro!`
    )
    .setFooter({ text: "Hunter's Store - Os melhores preços do velho oeste!" })
    .setTimestamp();

  const backButton = new ButtonBuilder()
    .setCustomId(`hunterstore_back_${userId}`)
    .setLabel("Vender Mais Itens")
    .setStyle(ButtonStyle.Primary)
    .setEmoji("🏪");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(backButton);

  await interaction.editReply({
    embeds: [successEmbed],
    components: [row],
  });
}

export async function handleHunterStoreSupply(
  interaction: ButtonInteraction,
): Promise<void> {
  const userId = interaction.user.id;

  if (!interaction.customId.endsWith(userId)) {
    await interaction.reply({
      content: "❌ Este botão não é para você!",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferUpdate();

  const userSilver = getItem(userId, "silver");

  const supplyEmbed = new EmbedBuilder()
    .setColor("#d4af37")
    .setTitle(`🪱 Hunter's Store - Suprimentos`)
    .setDescription(
      `Compre suprimentos essenciais para suas aventuras!\n\n` +
      `${getEmoji("coin")} **Seu saldo:** ${userSilver.toLocaleString()} moedas de prata\n\n` +
      `**Iscas disponíveis:**\n\n` +
      `🪱 **Isca Básica** (COMUM)\n` +
      `├ Preço: ${getEmoji("coin")} **5** moedas/unidade\n` +
      `├ Efeito: Pesca peixes comuns e incomuns\n` +
      `└ Pacote de 10: **50 moedas**\n\n` +
      `🦗 **Isca Premium** (INCOMUM)\n` +
      `├ Preço: ${getEmoji("coin")} **12** moedas/unidade\n` +
      `├ Efeito: ⭐ Aumenta chance de peixes raros, épicos e lendários!\n` +
      `└ Pacote de 10: **120 moedas**\n\n` +
      `Escolha qual isca deseja comprar:`
    )
    .setFooter({ text: "Iscas melhores = Peixes melhores!" })
    .setTimestamp();

  const basicBaitButton = new ButtonBuilder()
    .setCustomId(`hunterstore_buy_basic_bait_${userId}`)
    .setLabel(`10x Isca Básica (50 moedas)`)
    .setStyle(ButtonStyle.Primary)
    .setEmoji("🪱");

  const premiumBaitButton = new ButtonBuilder()
    .setCustomId(`hunterstore_buy_premium_bait_${userId}`)
    .setLabel(`10x Isca Premium (120 moedas)`)
    .setStyle(ButtonStyle.Success)
    .setEmoji("🦗");

  const backButton = new ButtonBuilder()
    .setCustomId(`hunterstore_back_${userId}`)
    .setLabel("Voltar")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("◀️");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    basicBaitButton,
    premiumBaitButton,
    backButton,
  );

  await interaction.editReply({
    embeds: [supplyEmbed],
    components: [row],
  });
}

export async function handleHunterStoreBuyBasicBait(
  interaction: ButtonInteraction,
): Promise<void> {
  const userId = interaction.customId.split("_").pop()!;

  if (interaction.user.id !== userId) {
    await interaction.reply({
      content: "❌ Este botão não é para você!",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferUpdate();

  const quantity = 10;
  const pricePerUnit = 5;
  const totalCost = pricePerUnit * quantity;
  const userSilver = getItem(userId, "silver");

  if (userSilver < totalCost) {
    const noMoneyEmbed = warningEmbed(
      "❌ Moedas Insuficientes",
      `Você não tem moedas suficientes para comprar **${quantity}x Isca Básica**!\n\n` +
      `Custo total: ${getEmoji("coin")} **${totalCost.toLocaleString()}** moedas\n` +
      `Seu saldo: ${getEmoji("coin")} **${userSilver.toLocaleString()}** moedas\n` +
      `Faltam: ${getEmoji("coin")} **${(totalCost - userSilver).toLocaleString()}** moedas`,
      "Venda itens para conseguir mais moedas!",
    );

    await interaction.editReply({
      embeds: [noMoneyEmbed],
      components: [],
    });
    return;
  }

  await removeItem(userId, "silver", totalCost);
  await addItem(userId, "basic_bait", quantity);

  const successEmbed = new EmbedBuilder()
    .setColor("#10b981")
    .setTitle(`${getEmoji("check")} Compra Realizada com Sucesso!`)
    .setDescription(
      `Você comprou suprimentos na **Hunter's Store**!\n\n` +
      `🪱 **Isca Básica**\n` +
      `├ Quantidade comprada: **${quantity}x**\n` +
      `├ Preço unitário: ${getEmoji("coin")} **${pricePerUnit}** moedas\n` +
      `└ Total pago: ${getEmoji("coin")} **${totalCost.toLocaleString()}** moedas de prata\n\n` +
      `${getEmoji("coin")} Saldo restante: **${(userSilver - totalCost).toLocaleString()}** moedas\n\n` +
      `🎣 Agora você pode pescar com \`/fish\`!`
    )
    .setFooter({ text: "Hunter's Store - Suprimentos de qualidade!" })
    .setTimestamp();

  const buyMoreButton = new ButtonBuilder()
    .setCustomId(`hunterstore_buy_basic_bait_${userId}`)
    .setLabel(`Comprar Mais (${totalCost} moedas)`)
    .setStyle(ButtonStyle.Success)
    .setEmoji("🪱");

  const backButton = new ButtonBuilder()
    .setCustomId(`hunterstore_back_${userId}`)
    .setLabel("Voltar ao Menu")
    .setStyle(ButtonStyle.Primary)
    .setEmoji("🏪");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    buyMoreButton,
    backButton,
  );

  await interaction.editReply({
    embeds: [successEmbed],
    components: [row],
  });
}

export async function handleHunterStoreBuyPremiumBait(
  interaction: ButtonInteraction,
): Promise<void> {
  const userId = interaction.customId.split("_").pop()!;

  if (interaction.user.id !== userId) {
    await interaction.reply({
      content: "❌ Este botão não é para você!",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferUpdate();

  const quantity = 10;
  const pricePerUnit = 12;
  const totalCost = pricePerUnit * quantity;
  const userSilver = getItem(userId, "silver");

  if (userSilver < totalCost) {
    const noMoneyEmbed = warningEmbed(
      "❌ Moedas Insuficientes",
      `Você não tem moedas suficientes para comprar **${quantity}x Isca Premium**!\n\n` +
      `Custo total: ${getEmoji("coin")} **${totalCost.toLocaleString()}** moedas\n` +
      `Seu saldo: ${getEmoji("coin")} **${userSilver.toLocaleString()}** moedas\n` +
      `Faltam: ${getEmoji("coin")} **${(totalCost - userSilver).toLocaleString()}** moedas`,
      "Venda itens para conseguir mais moedas!",
    );

    await interaction.editReply({
      embeds: [noMoneyEmbed],
      components: [],
    });
    return;
  }

  await removeItem(userId, "silver", totalCost);
  await addItem(userId, "premium_bait", quantity);

  const successEmbed = new EmbedBuilder()
    .setColor("#10b981")
    .setTitle(`${getEmoji("check")} Compra Realizada com Sucesso!`)
    .setDescription(
      `Você comprou suprimentos na **Hunter's Store**!\n\n` +
      `🦗 **Isca Premium**\n` +
      `├ Quantidade comprada: **${quantity}x**\n` +
      `├ Preço unitário: ${getEmoji("coin")} **${pricePerUnit}** moedas\n` +
      `└ Total pago: ${getEmoji("coin")} **${totalCost.toLocaleString()}** moedas de prata\n\n` +
      `${getEmoji("coin")} Saldo restante: **${(userSilver - totalCost).toLocaleString()}** moedas\n\n` +
      `⭐ **Isca Premium aumenta muito a chance de peixes raros!**\n` +
      `🎣 Use \`/fish\` para começar a pescar!`
    )
    .setFooter({ text: "Hunter's Store - Suprimentos premium para pescadores exigentes!" })
    .setTimestamp();

  const buyMoreButton = new ButtonBuilder()
    .setCustomId(`hunterstore_buy_premium_bait_${userId}`)
    .setLabel(`Comprar Mais (${totalCost} moedas)`)
    .setStyle(ButtonStyle.Success)
    .setEmoji("🦗");

  const backButton = new ButtonBuilder()
    .setCustomId(`hunterstore_back_${userId}`)
    .setLabel("Voltar ao Menu")
    .setStyle(ButtonStyle.Primary)
    .setEmoji("🏪");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    buyMoreButton,
    backButton,
  );

  await interaction.editReply({
    embeds: [successEmbed],
    components: [row],
  });
}
