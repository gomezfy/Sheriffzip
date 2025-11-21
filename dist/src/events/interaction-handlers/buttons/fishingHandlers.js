"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFishLeft = handleFishLeft;
exports.handleFishRight = handleFishRight;
exports.handleFishCatch = handleFishCatch;
const discord_js_1 = require("discord.js");
const fishingSessionManager_1 = require("../../../utils/fishingSessionManager");
const inventoryManager_1 = require("../../../utils/inventoryManager");
const xpManager_1 = require("../../../utils/xpManager");
const customEmojis_1 = require("../../../utils/customEmojis");
const embeds_1 = require("../../../utils/embeds");
const transactionLock_1 = require("../../../utils/transactionLock");
/**
 * Handler para mover a barra para a esquerda
 */
async function handleFishLeft(interaction) {
    const userId = interaction.customId.split("_")[2];
    // Verificar se é o usuário correto
    if (interaction.user.id !== userId) {
        await interaction.reply({
            content: "❌ Esta pesca não é sua!",
            ephemeral: true,
        });
        return;
    }
    await interaction.deferUpdate();
    const session = fishingSessionManager_1.fishingSessionManager.moveLeft(userId);
    if (!session) {
        const embed = (0, embeds_1.errorEmbed)("❌ Sessão Expirada", "Sua sessão de pesca expirou! Use `/fish` para começar novamente.");
        await interaction.editReply({ embeds: [embed], components: [] });
        return;
    }
    // Atualizar o embed com a nova posição
    await updateFishingEmbed(interaction, userId);
}
/**
 * Handler para mover a barra para a direita
 */
async function handleFishRight(interaction) {
    const userId = interaction.customId.split("_")[2];
    // Verificar se é o usuário correto
    if (interaction.user.id !== userId) {
        await interaction.reply({
            content: "❌ Esta pesca não é sua!",
            ephemeral: true,
        });
        return;
    }
    await interaction.deferUpdate();
    const session = fishingSessionManager_1.fishingSessionManager.moveRight(userId);
    if (!session) {
        const embed = (0, embeds_1.errorEmbed)("❌ Sessão Expirada", "Sua sessão de pesca expirou! Use `/fish` para começar novamente.");
        await interaction.editReply({ embeds: [embed], components: [] });
        return;
    }
    // Atualizar o embed com a nova posição
    await updateFishingEmbed(interaction, userId);
}
/**
 * Handler para tentar pegar o peixe
 */
async function handleFishCatch(interaction) {
    const userId = interaction.customId.split("_")[2];
    // Verificar se é o usuário correto
    if (interaction.user.id !== userId) {
        await interaction.reply({
            content: "❌ Esta pesca não é sua!",
            ephemeral: true,
        });
        return;
    }
    await interaction.deferUpdate();
    const result = fishingSessionManager_1.fishingSessionManager.checkCatch(userId);
    if (!result.session) {
        const embed = (0, embeds_1.errorEmbed)("❌ Sessão Expirada", "Sua sessão de pesca expirou! Use `/fish` para começar novamente.");
        await interaction.editReply({ embeds: [embed], components: [] });
        return;
    }
    const session = result.session;
    // Verificar se venceu
    if (fishingSessionManager_1.fishingSessionManager.hasWon(userId)) {
        // VITÓRIA - Pegou o peixe! (usar transaction lock)
        const fishItem = session.fishRewards.fish;
        await transactionLock_1.transactionLock.withLock(userId, async () => {
            (0, inventoryManager_1.addItem)(userId, fishItem.id, fishItem.amount);
            (0, inventoryManager_1.reduceDurability)(userId, "fishing_rod", 1);
            (0, xpManager_1.addXp)(userId, session.fishExperience);
        });
        const successEmb = (0, embeds_1.successEmbed)(`${(0, customEmojis_1.getEmoji)("trophy")} Peixe Capturado!`, `🎉 Parabéns! Você pescou um **${session.fishName}**!\n\n` +
            `**Recompensas:**\n` +
            `${session.fishEmoji} ${session.fishName} x${fishItem.amount}\n` +
            `${(0, customEmojis_1.getEmoji)("star")} +${session.fishExperience} XP\n\n` +
            `**Estatísticas:**\n` +
            `✅ Acertos na zona: ${session.successfulCatches}/${session.requiredCatches}\n` +
            `🎯 Tentativas usadas: ${session.maxAttempts - session.attemptsRemaining}/${session.maxAttempts}\n\n` +
            `Use \`/hunterstore\` para vender seus peixes!`);
        fishingSessionManager_1.fishingSessionManager.endSession(userId);
        await interaction.editReply({ embeds: [successEmb], components: [] });
        return;
    }
    // Verificar se perdeu
    if (fishingSessionManager_1.fishingSessionManager.hasLost(userId)) {
        // DERROTA - Ficou sem tentativas
        const lostEmbed = new discord_js_1.EmbedBuilder()
            .setColor("#ef4444")
            .setTitle("💔 O Peixe Escapou!")
            .setDescription(`Que pena! O **${session.fishName}** conseguiu escapar...\n\n` +
            `Você ficou sem tentativas antes de acertar a zona verde vezes suficientes.\n\n` +
            `**Estatísticas Finais:**\n` +
            `✅ Acertos: ${session.successfulCatches}/${session.requiredCatches}\n` +
            `❌ Faltaram: ${session.requiredCatches - session.successfulCatches} acertos\n\n` +
            `Tente novamente com \`/fish\`!`)
            .setFooter({ text: "Dica: Fique atento ao movimento da barra e time seus cliques!" })
            .setTimestamp();
        fishingSessionManager_1.fishingSessionManager.endSession(userId);
        await interaction.editReply({ embeds: [lostEmbed], components: [] });
        return;
    }
    // Continua jogando - Atualizar com feedback
    await updateFishingEmbed(interaction, userId, result.success);
}
/**
 * Atualiza o embed de pesca com a posição atual
 */
async function updateFishingEmbed(interaction, userId, lastCatchAttempt) {
    const session = fishingSessionManager_1.fishingSessionManager.getSession(userId);
    if (!session)
        return;
    const bar = fishingSessionManager_1.fishingSessionManager.generateBar(userId);
    let feedbackText = "";
    if (lastCatchAttempt !== undefined) {
        if (lastCatchAttempt) {
            feedbackText = `\n✅ **ACERTOU A ZONA!** (${session.successfulCatches}/${session.requiredCatches})`;
        }
        else {
            feedbackText = `\n❌ **ERROU!** Fora da zona verde.`;
        }
    }
    const fishEmbed = new discord_js_1.EmbedBuilder()
        .setColor(session.fishRarityColor)
        .setTitle(`${(0, customEmojis_1.getEmoji)("dart")} Pescando: ${session.fishName}`)
        .setDescription(`${session.fishEmoji} **${session.fishName}** (${session.fishRarity})\n` +
        `⚡ Dificuldade: ${"🔥".repeat(session.fishDifficulty)}\n\n` +
        `**Barra de Posição:**\n\`\`\`${bar}\`\`\`${feedbackText}\n\n` +
        `**${(0, customEmojis_1.getEmoji)("info")} Dica:** Mantenha o 🎣 na zona verde 🟢 e pressione ✅ PEGAR!`)
        .addFields({
        name: `${(0, customEmojis_1.getEmoji)("timer")} Status`,
        value: `⏱️ Tentativas: ${session.attemptsRemaining}/${session.maxAttempts}\n✅ Acertos: ${session.successfulCatches}/${session.requiredCatches}`,
        inline: true
    }, {
        name: `${(0, customEmojis_1.getEmoji)("gift")} Progresso`,
        value: `🎯 Faltam: ${session.requiredCatches - session.successfulCatches} acertos\n📊 ${Math.floor((session.successfulCatches / session.requiredCatches) * 100)}% completo`,
        inline: true
    })
        .setFooter({
        text: `🎣 Use 🔙 e 🔜 para mover, depois pressione ✅ PEGAR quando estiver na zona verde!`
    })
        .setTimestamp();
    const leftButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`fish_left_${userId}`)
        .setLabel("🔙 Esquerda")
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setEmoji("◀️");
    const rightButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`fish_right_${userId}`)
        .setLabel("🔜 Direita")
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setEmoji("▶️");
    const catchButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`fish_catch_${userId}`)
        .setLabel("✅ PEGAR!")
        .setStyle(discord_js_1.ButtonStyle.Success)
        .setEmoji("🎣");
    const row = new discord_js_1.ActionRowBuilder().addComponents(leftButton, catchButton, rightButton);
    await interaction.editReply({
        embeds: [fishEmbed],
        components: [row],
    });
}
//# sourceMappingURL=fishingHandlers.js.map