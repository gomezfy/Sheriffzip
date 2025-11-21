"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleViewPrizes = handleViewPrizes;
exports.handleViewRanking = handleViewRanking;
const evento_1 = require("../../../commands/events/evento");
async function handleViewPrizes(interaction) {
    try {
        const locale = interaction.locale || 'pt-BR';
        const embed = (0, evento_1.createPrizesEmbed)(locale);
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
    catch (error) {
        console.error("Error showing prizes:", error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: "❌ Erro ao exibir prêmios.",
                ephemeral: true,
            }).catch(() => { });
        }
    }
}
async function handleViewRanking(interaction) {
    try {
        const locale = interaction.locale || 'pt-BR';
        const embed = (0, evento_1.createRankingEmbed)(interaction.user.id, locale);
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
    catch (error) {
        console.error("Error showing ranking:", error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: "❌ Erro ao exibir ranking.",
                ephemeral: true,
            }).catch(() => { });
        }
    }
}
//# sourceMappingURL=eventHandlers.js.map