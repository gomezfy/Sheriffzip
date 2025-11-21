import { ButtonInteraction } from "discord.js";
import { createPrizesEmbed, createRankingEmbed } from "../../../commands/events/evento";

export async function handleViewPrizes(interaction: ButtonInteraction): Promise<void> {
  try {
    const locale = interaction.locale || 'pt-BR';
    const embed = createPrizesEmbed(locale);
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  } catch (error) {
    console.error("Error showing prizes:", error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ Erro ao exibir prêmios.",
        ephemeral: true,
      }).catch(() => {});
    }
  }
}

export async function handleViewRanking(interaction: ButtonInteraction): Promise<void> {
  try {
    const locale = interaction.locale || 'pt-BR';
    const embed = createRankingEmbed(interaction.user.id, locale);
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  } catch (error) {
    console.error("Error showing ranking:", error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ Erro ao exibir ranking.",
        ephemeral: true,
      }).catch(() => {});
    }
  }
}
