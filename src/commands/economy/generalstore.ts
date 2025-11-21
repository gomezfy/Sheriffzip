import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
} from 'discord.js';
import { applyLocalizations } from '../../utils/commandLocalizations';
import { getStoreItemsByCategory, getCategoryName } from '../../utils/generalStoreManager';
import { getInventory } from '../../utils/inventoryManager';
import { createStoreItemCanvas } from '../../utils/generalStoreCanvas';

const commandBuilder = new SlashCommandBuilder()
  .setName('generalstore')
  .setDescription('🏪 Loja Geral - Compre itens úteis para sua jornada')
  .setContexts([0, 1, 2])
  .setIntegrationTypes([0, 1]);

export default {
  data: applyLocalizations(commandBuilder, 'generalstore'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const category = 'all';
    const allItems = getStoreItemsByCategory(category);
    const startIndex = 0;
    const item = allItems[startIndex];
    
    const inventory = getInventory(interaction.user.id);
    const userTokens = inventory.items['saloon_token'] || 0;
    
    let userHasItem = false;
    if (item.category === 'backpacks') {
      userHasItem = inventory.purchasedBackpacks?.includes(item.id) || false;
    } else {
      userHasItem = inventory.items[item.id] ? inventory.items[item.id] > 0 : false;
    }

    const canvasBuffer = await createStoreItemCanvas(item, userTokens, userHasItem);
    const attachment = new AttachmentBuilder(canvasBuffer, {
      name: 'store_item.png',
    });

    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`gstore_prev_${startIndex}_${category}`)
        .setLabel('<')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(startIndex === 0),
      new ButtonBuilder()
        .setCustomId(`gstore_buy_${item.id}_${startIndex}_${category}`)
        .setLabel(userHasItem ? 'Já Possui' : 'Comprar')
        .setStyle(userHasItem ? ButtonStyle.Secondary : ButtonStyle.Success)
        .setDisabled(userHasItem || userTokens < item.price),
      new ButtonBuilder()
        .setCustomId(`gstore_next_${startIndex}_${category}`)
        .setLabel('>')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(startIndex === allItems.length - 1)
    );

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`gstore_cat_${category}_${startIndex}`)
        .setLabel(`Categoria: ${getCategoryName(category)}`)
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.editReply({
      files: [attachment],
      components: [row1, row2],
    });
  },
};
