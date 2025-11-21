import {
  ButtonInteraction,
  AttachmentBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { getStoreItemsByCategory, getStoreItemById, getCategoryName } from '@/utils/generalStoreManager';
import { getInventory, addItem } from '@/utils/inventoryManager';
import { createStoreItemCanvas } from '@/utils/generalStoreCanvas';
import { getSaloonTokenEmoji, getSilverCoinEmoji } from '@/utils/customEmojis';
import { getUserSilver, removeUserSilver } from '@/utils/dataManager';

export async function handleGeneralStoreNavigation(
  interaction: ButtonInteraction,
): Promise<void> {
  await interaction.deferUpdate();
  
  const parts = interaction.customId.split('_');
  const action = parts[1];
  const currentIndex = parseInt(parts[2]);
  const category = parts[3] || 'all';

  const allItems = getStoreItemsByCategory(category as any);
  let newIndex = currentIndex;

  if (action === 'next') {
    newIndex = (currentIndex + 1) % allItems.length;
  } else if (action === 'prev') {
    newIndex = currentIndex - 1;
    if (newIndex < 0) {
      newIndex = allItems.length - 1;
    }
  }

  const item = allItems[newIndex];
  const inventory = getInventory(interaction.user.id);
  const userTokens = inventory.items['saloon_token'] || 0;
  const userSilver = getUserSilver(interaction.user.id);
  
  let userHasItem = false;
  if (item.category === 'backpacks') {
    userHasItem = inventory.purchasedBackpacks?.includes(item.id) || false;
  } else {
    userHasItem = inventory.items[item.id] ? inventory.items[item.id] > 0 : false;
  }

  const canvasBuffer = await createStoreItemCanvas(item, userTokens, userHasItem, userSilver);
  const attachment = new AttachmentBuilder(canvasBuffer, {
    name: 'store_item.png',
  });

  const currency = item.currency || 'tokens';
  const userBalance = currency === 'silver' ? userSilver : userTokens;

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`gstore_prev_${newIndex}_${category}`)
      .setLabel('<')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(newIndex === 0),
    new ButtonBuilder()
      .setCustomId(`gstore_buy_${item.id}_${newIndex}_${category}`)
      .setLabel(userHasItem ? 'Já Possui' : 'Comprar')
      .setStyle(userHasItem ? ButtonStyle.Secondary : ButtonStyle.Success)
      .setDisabled(userHasItem || userBalance < item.price),
    new ButtonBuilder()
      .setCustomId(`gstore_next_${newIndex}_${category}`)
      .setLabel('>')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(newIndex === allItems.length - 1)
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`gstore_cat_${category}_${newIndex}`)
      .setLabel(`Categoria: ${getCategoryName(category)}`)
      .setStyle(ButtonStyle.Primary)
  );

  await interaction.editReply({
    files: [attachment],
    components: [row1, row2],
  });
}

export async function handleGeneralStoreCategory(
  interaction: ButtonInteraction,
): Promise<void> {
  await interaction.deferUpdate();
  
  const parts = interaction.customId.split('_');
  const currentCategory = parts[2];
  
  const categories = ['all', 'tools', 'backpacks'];
  const currentCategoryIndex = categories.indexOf(currentCategory);
  const newCategory = categories[(currentCategoryIndex + 1) % categories.length];
  
  const allItems = getStoreItemsByCategory(newCategory as any);
  const newIndex = 0;
  const item = allItems[newIndex];
  
  const inventory = getInventory(interaction.user.id);
  const userTokens = inventory.items['saloon_token'] || 0;
  const userSilver = getUserSilver(interaction.user.id);
  
  let userHasItem = false;
  if (item.category === 'backpacks') {
    userHasItem = inventory.purchasedBackpacks?.includes(item.id) || false;
  } else {
    userHasItem = inventory.items[item.id] ? inventory.items[item.id] > 0 : false;
  }

  const canvasBuffer = await createStoreItemCanvas(item, userTokens, userHasItem, userSilver);
  const attachment = new AttachmentBuilder(canvasBuffer, {
    name: 'store_item.png',
  });

  const currency = item.currency || 'tokens';
  const userBalance = currency === 'silver' ? userSilver : userTokens;

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`gstore_prev_${newIndex}_${newCategory}`)
      .setLabel('<')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(newIndex === 0),
    new ButtonBuilder()
      .setCustomId(`gstore_buy_${item.id}_${newIndex}_${newCategory}`)
      .setLabel(userHasItem ? 'Já Possui' : 'Comprar')
      .setStyle(userHasItem ? ButtonStyle.Secondary : ButtonStyle.Success)
      .setDisabled(userHasItem || userBalance < item.price),
    new ButtonBuilder()
      .setCustomId(`gstore_next_${newIndex}_${newCategory}`)
      .setLabel('>')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(newIndex === allItems.length - 1)
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`gstore_cat_${newCategory}_${newIndex}`)
      .setLabel(`Categoria: ${getCategoryName(newCategory)}`)
      .setStyle(ButtonStyle.Primary)
  );

  await interaction.editReply({
    files: [attachment],
    components: [row1, row2],
  });
}

export async function handleGeneralStorePurchase(
  interaction: ButtonInteraction,
): Promise<void> {
  const parts = interaction.customId.split('_');
  const category = parts[parts.length - 1];
  const currentIndex = parseInt(parts[parts.length - 2]);
  const itemId = parts.slice(2, -2).join('_');

  const item = getStoreItemById(itemId);
  if (!item) {
    await interaction.reply({
      content: '❌ Item não encontrado!',
      ephemeral: true,
    });
    return;
  }

  const inventory = getInventory(interaction.user.id);
  const currency = item.currency || 'tokens';
  const userTokens = inventory.items['saloon_token'] || 0;
  const userSilver = currency === 'silver' ? getUserSilver(interaction.user.id) : 0;
  const userBalance = currency === 'silver' ? userSilver : userTokens;
  
  let userHasItem = false;
  if (item.category === 'backpacks') {
    userHasItem = inventory.purchasedBackpacks?.includes(item.id) || false;
  } else {
    userHasItem = inventory.items[item.id] ? inventory.items[item.id] > 0 : false;
  }

  if (userHasItem) {
    await interaction.reply({
      content: '❌ Você já possui este item!',
      ephemeral: true,
    });
    return;
  }

  if (userBalance < item.price) {
    const currencyEmoji = currency === 'silver' ? getSilverCoinEmoji() : getSaloonTokenEmoji();
    const currencyName = currency === 'silver' ? 'moedas de prata' : 'tokens';
    await interaction.reply({
      content: `❌ Você não tem ${currencyName} suficientes!\n\n**Necessário:** ${currencyEmoji} ${item.price.toLocaleString()}\n**Você tem:** ${currencyEmoji} ${userBalance.toLocaleString()}`,
      ephemeral: true,
    });
    return;
  }

  if (currency === 'silver') {
    await removeUserSilver(interaction.user.id, item.price);
  } else {
    inventory.items['saloon_token'] = userTokens - item.price;
  }
  
  let result;
  
  if (item.category === 'backpacks' && item.backpackCapacity) {
    const { saveInventory } = await import('@/utils/inventoryManager');
    const newCapacity = inventory.maxWeight + item.backpackCapacity;
    
    inventory.maxWeight = newCapacity;
    
    if (!inventory.purchasedBackpacks) {
      inventory.purchasedBackpacks = [];
    }
    inventory.purchasedBackpacks.push(item.id);
    
    saveInventory(interaction.user.id, inventory);
    
    result = { success: true };
  } else {
    result = await addItem(interaction.user.id, item.id, 1);
  }

  if (result.success) {
    const currencyEmoji = currency === 'silver' ? getSilverCoinEmoji() : getSaloonTokenEmoji();
    const newBalance = currency === 'silver' ? getUserSilver(interaction.user.id) : (userTokens - item.price);
    
    let description = `Você comprou **${item.name}**!\n\n` +
      `💰 **Preço:** ${currencyEmoji} ${item.price.toLocaleString()}\n` +
      `💳 **Saldo Restante:** ${currencyEmoji} ${newBalance.toLocaleString()}`;
    
    if (item.category === 'backpacks' && item.backpackCapacity) {
      const newInventory = getInventory(interaction.user.id);
      description += `\n\n🎒 **Nova Capacidade:** ${newInventory.maxWeight}kg`;
    }
    
    const successEmbed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle('✅ Compra Realizada!')
      .setDescription(description)
      .setTimestamp();

    await interaction.reply({
      embeds: [successEmbed],
      ephemeral: true,
    });

    setTimeout(async () => {
      try {
        await interaction.message.delete();
      } catch (error) {
        console.error('Error deleting store message:', error);
      }
    }, 1500);
  } else {
    await interaction.reply({
      content: `❌ Erro ao comprar o item: ${result.error}`,
      ephemeral: true,
    });
  }
}
