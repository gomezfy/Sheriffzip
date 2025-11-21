"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showProgressBar = showProgressBar;
exports.createProgressBarString = createProgressBarString;
const discord_js_1 = require("discord.js");
async function showProgressBar(interaction, title, description, duration, color = "#B8860B") {
    const steps = 10;
    const stepDuration = duration / steps;
    for (let i = 0; i <= steps; i++) {
        const percentage = Math.floor((i / steps) * 100);
        const filledBlocks = Math.floor((i / steps) * 20);
        const emptyBlocks = 20 - filledBlocks;
        const progressBar = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(`**${description}**\n\n\`${progressBar}\` ${percentage}%`)
            .setTimestamp();
        try {
            if (i === 0) {
                await interaction.editReply({
                    embeds: [embed],
                    components: [],
                    files: [],
                });
            }
            else {
                await interaction.editReply({ embeds: [embed] });
            }
        }
        catch (error) {
            console.error("Error updating progress bar:", error);
        }
        if (i < steps) {
            await new Promise((resolve) => setTimeout(resolve, stepDuration));
        }
    }
}
function createProgressBarString(percentage, length = 20, fillChar = "█", emptyChar = "░") {
    const filledBlocks = Math.floor((percentage / 100) * length);
    const emptyBlocks = length - filledBlocks;
    return fillChar.repeat(filledBlocks) + emptyChar.repeat(emptyBlocks);
}
//# sourceMappingURL=progressBar.js.map