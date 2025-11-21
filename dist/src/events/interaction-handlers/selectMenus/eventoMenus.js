"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventoSelectMenu = createEventoSelectMenu;
exports.handleEventoSelectMenu = handleEventoSelectMenu;
const discord_js_1 = require("discord.js");
const eventManager_1 = require("../../../utils/eventManager");
const customEmojis_1 = require("../../../utils/customEmojis");
/**
 * Factory function to create the evento select menu
 * This ensures consistency across all interactions
 */
function createEventoSelectMenu() {
    const selectMenu = new discord_js_1.StringSelectMenuBuilder()
        .setCustomId('evento_select_menu')
        .setPlaceholder('Selecione uma opção...')
        .addOptions(new discord_js_1.StringSelectMenuOptionBuilder()
        .setLabel('Classificação Mineração')
        .setDescription('Ver ranking dos melhores mineradores')
        .setValue('mining_classification')
        .setEmoji('1440185926889377872'), // PICKAXE custom emoji
    new discord_js_1.StringSelectMenuOptionBuilder()
        .setLabel('Prêmios Mineração')
        .setDescription('Ver prêmios da Corrida do Ouro')
        .setValue('mining_prizes')
        .setEmoji('1440185971210453023'), // TROPHY custom emoji
    new discord_js_1.StringSelectMenuOptionBuilder()
        .setLabel('Classificação Caça')
        .setDescription('Ver ranking dos melhores caçadores')
        .setValue('hunting_classification')
        .setEmoji('1440185961081212978'), // DART custom emoji
    new discord_js_1.StringSelectMenuOptionBuilder()
        .setLabel('Prêmios Caça')
        .setDescription('Ver prêmios do evento de caça')
        .setValue('hunting_prizes')
        .setEmoji('1440185971210453023') // TROPHY custom emoji
    );
    return new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
}
/**
 * Handler for evento select menu
 */
async function handleEventoSelectMenu(interaction) {
    await interaction.deferUpdate();
    const selectedValue = interaction.values[0];
    try {
        switch (selectedValue) {
            case 'mining_classification':
                await handleMiningClassification(interaction);
                break;
            case 'mining_prizes':
                await handleMiningPrizes(interaction);
                break;
            case 'hunting_classification':
                await handleHuntingClassification(interaction);
                break;
            case 'hunting_prizes':
                await handleHuntingPrizes(interaction);
                break;
            default:
                throw new Error(`Unknown selection: ${selectedValue}`);
        }
    }
    catch (error) {
        console.error("Error in handleEventoSelectMenu:", error);
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle("❌ Erro")
            .setDescription("Ocorreu um erro ao processar sua seleção.");
        await interaction.editReply({
            embeds: [errorEmbed],
            files: [],
            components: [createEventoSelectMenu()]
        });
    }
}
/**
 * Handler for mining classification
 */
async function handleMiningClassification(interaction) {
    const miningEvent = (0, eventManager_1.getCurrentEvent)();
    const leaderboard = (0, eventManager_1.getEventLeaderboard)().slice(0, 10);
    const pickaxeEmoji = (0, customEmojis_1.getPickaxeEmoji)();
    const goldMedalEmoji = (0, customEmojis_1.getGoldMedalEmoji)();
    const silverMedalEmoji = (0, customEmojis_1.getSilverMedalEmoji)();
    const bronzeMedalEmoji = (0, customEmojis_1.getBronzeMedalEmoji)();
    const goldBarEmoji = (0, customEmojis_1.getGoldBarEmoji)();
    const timerEmoji = (0, customEmojis_1.getTimerEmoji)();
    if (!miningEvent) {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle("❌ Evento não encontrado")
            .setDescription("Não há evento de mineração ativo no momento.");
        await interaction.editReply({
            embeds: [embed],
            components: [createEventoSelectMenu()]
        });
        return;
    }
    const timeLeft = miningEvent.endTime - Date.now();
    let description = `**${miningEvent.name}**\n`;
    description += miningEvent.active
        ? `${timerEmoji} **${(0, eventManager_1.formatTimeRemaining)(timeLeft)}** restante\n📊 Fase ${miningEvent.phase + 1}/7\n\n`
        : `⏸️ Evento encerrado\n\n`;
    // Ranking
    if (leaderboard.length === 0) {
        description += `${pickaxeEmoji} **Top Mineradores**\n\n`;
        description += `Nenhum participante ainda. Use \`/mine\` para participar!`;
    }
    else {
        description += `${pickaxeEmoji} **Top 10 Mineradores**\n\n`;
        for (let i = 0; i < leaderboard.length; i++) {
            const participant = leaderboard[i];
            let medal = "";
            if (i === 0)
                medal = goldMedalEmoji;
            else if (i === 1)
                medal = silverMedalEmoji;
            else if (i === 2)
                medal = bronzeMedalEmoji;
            else
                medal = `\`${i + 1}º\``;
            description += `${medal} **${participant.username}**\n`;
            description += `   ${goldBarEmoji} ${participant.goldMined.toLocaleString()} ouro • ${participant.points.toLocaleString()} pontos\n\n`;
        }
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(0xFF6B00)
        .setTitle(`${pickaxeEmoji} Classificação - Mineração`)
        .setDescription(description)
        .setFooter({ text: "1 ouro = 40 pontos" })
        .setTimestamp();
    await interaction.editReply({
        embeds: [embed],
        components: [createEventoSelectMenu()]
    });
}
/**
 * Handler for mining prizes
 */
async function handleMiningPrizes(interaction) {
    const trophyEmoji = (0, customEmojis_1.getTrophyEmoji)();
    const goldMedalEmoji = (0, customEmojis_1.getGoldMedalEmoji)();
    const silverMedalEmoji = (0, customEmojis_1.getSilverMedalEmoji)();
    const bronzeMedalEmoji = (0, customEmojis_1.getBronzeMedalEmoji)();
    const silverCoinEmoji = (0, customEmojis_1.getSilverCoinEmoji)();
    const saloonTokenEmoji = (0, customEmojis_1.getSaloonTokenEmoji)();
    const sparklesEmoji = (0, customEmojis_1.getSparklesEmoji)();
    const pickaxeEmoji = (0, customEmojis_1.getPickaxeEmoji)();
    const moneybagEmoji = (0, customEmojis_1.getMoneybagEmoji)();
    const prizes = [
        { position: 1, silver: 300000, tokens: 300, xp: 3500, medal: goldMedalEmoji },
        { position: 2, silver: 200000, tokens: 200, xp: 1750, medal: silverMedalEmoji },
        { position: 3, silver: 100000, tokens: 100, xp: 875, medal: bronzeMedalEmoji },
        { position: 4, silver: 50000, tokens: 50, xp: 400, medal: "`4º`" },
        { position: 5, silver: 40000, tokens: 40, xp: 350, medal: "`5º`" },
        { position: 6, silver: 30000, tokens: 30, xp: 300, medal: "`6º`" },
        { position: 7, silver: 20000, tokens: 20, xp: 250, medal: "`7º`" },
        { position: 8, silver: 15000, tokens: 15, xp: 200, medal: "`8º`" },
        { position: 9, silver: 10000, tokens: 10, xp: 150, medal: "`9º`" },
        { position: 10, silver: 5000, tokens: 5, xp: 100, medal: "`10º`" },
    ];
    let description = `**Corrida do Ouro - Top 10 Prêmios**\n\n`;
    description += `${pickaxeEmoji} Mine ouro e ganhe pontos: **1 ouro = 40 pontos**\n`;
    description += `${moneybagEmoji} Os 10 melhores mineradores ganham recompensas incríveis!\n\n`;
    description += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    prizes.forEach((prize) => {
        description += `${prize.medal} **${prize.position}º Lugar**\n`;
        description += `${silverCoinEmoji} **${prize.silver.toLocaleString()}** moedas de prata\n`;
        description += `${saloonTokenEmoji} **${prize.tokens}x** tokens do saloon\n`;
        description += `${sparklesEmoji} **${prize.xp.toLocaleString()}** XP\n\n`;
    });
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle(`${trophyEmoji} Prêmios - Evento de Mineração`)
        .setDescription(description)
        .setFooter({ text: "Os prêmios são distribuídos automaticamente ao fim do evento" })
        .setTimestamp();
    await interaction.editReply({
        embeds: [embed],
        components: [createEventoSelectMenu()]
    });
}
/**
 * Handler for hunting classification
 */
async function handleHuntingClassification(interaction) {
    const huntingEvent = (0, eventManager_1.getCurrentHuntingEvent)();
    const leaderboard = (0, eventManager_1.getHuntingEventLeaderboard)().slice(0, 10);
    const goldMedalEmoji = (0, customEmojis_1.getGoldMedalEmoji)();
    const silverMedalEmoji = (0, customEmojis_1.getSilverMedalEmoji)();
    const bronzeMedalEmoji = (0, customEmojis_1.getBronzeMedalEmoji)();
    const timerEmoji = (0, customEmojis_1.getTimerEmoji)();
    const statsEmoji = (0, customEmojis_1.getStatsEmoji)();
    const bearPeltEmoji = (0, customEmojis_1.getBearPeltEmoji)();
    const dartEmoji = (0, customEmojis_1.getDartEmoji)();
    if (!huntingEvent) {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle("❌ Evento não encontrado")
            .setDescription("Não há evento de caça ativo no momento.");
        await interaction.editReply({
            embeds: [embed],
            components: [createEventoSelectMenu()]
        });
        return;
    }
    const timeLeft = huntingEvent.endTime - Date.now();
    let description = `**${huntingEvent.name}**\n`;
    description += huntingEvent.active
        ? `${timerEmoji} **${(0, eventManager_1.formatTimeRemaining)(timeLeft)}** restante\n${statsEmoji} Fase ${huntingEvent.phase + 1}/7\n\n`
        : `⏸️ Evento encerrado\n\n`;
    // Ranking
    if (leaderboard.length === 0) {
        description += `${dartEmoji} **Top Caçadores**\n\n`;
        description += `Nenhum participante ainda. Use \`/hunt\` para participar!`;
    }
    else {
        description += `${dartEmoji} **Top 10 Caçadores**\n\n`;
        for (let i = 0; i < leaderboard.length; i++) {
            const participant = leaderboard[i];
            let medal = "";
            if (i === 0)
                medal = goldMedalEmoji;
            else if (i === 1)
                medal = silverMedalEmoji;
            else if (i === 2)
                medal = bronzeMedalEmoji;
            else
                medal = `\`${i + 1}º\``;
            description += `${medal} **${participant.username}**\n`;
            description += `   ${dartEmoji} ${participant.animalsKilled} animais • 🥩 ${participant.meatCollected} carne • ${bearPeltEmoji} ${participant.peltsCollected} peles\n`;
            description += `   ${statsEmoji} **${participant.points.toLocaleString()} pontos**\n\n`;
        }
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(0x2D5A3D)
        .setTitle(`${dartEmoji} Classificação - Caça`)
        .setDescription(description)
        .setFooter({ text: "1 pele = 50 pontos • 1 carne = 20 pontos" })
        .setTimestamp();
    await interaction.editReply({
        embeds: [embed],
        components: [createEventoSelectMenu()]
    });
}
/**
 * Handler for hunting prizes
 */
async function handleHuntingPrizes(interaction) {
    const trophyEmoji = (0, customEmojis_1.getTrophyEmoji)();
    const goldMedalEmoji = (0, customEmojis_1.getGoldMedalEmoji)();
    const silverMedalEmoji = (0, customEmojis_1.getSilverMedalEmoji)();
    const bronzeMedalEmoji = (0, customEmojis_1.getBronzeMedalEmoji)();
    const silverCoinEmoji = (0, customEmojis_1.getSilverCoinEmoji)();
    const saloonTokenEmoji = (0, customEmojis_1.getSaloonTokenEmoji)();
    const sparklesEmoji = (0, customEmojis_1.getSparklesEmoji)();
    const dartEmoji = (0, customEmojis_1.getDartEmoji)();
    const moneybagEmoji = (0, customEmojis_1.getMoneybagEmoji)();
    const prizes = [
        { position: 1, silver: 300000, tokens: 300, xp: 3500, medal: goldMedalEmoji },
        { position: 2, silver: 200000, tokens: 200, xp: 1750, medal: silverMedalEmoji },
        { position: 3, silver: 100000, tokens: 100, xp: 875, medal: bronzeMedalEmoji },
        { position: 4, silver: 50000, tokens: 50, xp: 400, medal: "`4º`" },
        { position: 5, silver: 40000, tokens: 40, xp: 350, medal: "`5º`" },
        { position: 6, silver: 30000, tokens: 30, xp: 300, medal: "`6º`" },
        { position: 7, silver: 20000, tokens: 20, xp: 250, medal: "`7º`" },
        { position: 8, silver: 15000, tokens: 15, xp: 200, medal: "`8º`" },
        { position: 9, silver: 10000, tokens: 10, xp: 150, medal: "`9º`" },
        { position: 10, silver: 5000, tokens: 5, xp: 100, medal: "`10º`" },
    ];
    let description = `**Caçada do Oeste - Top 10 Prêmios**\n\n`;
    description += `${dartEmoji} Cace animais e ganhe pontos:\n`;
    description += `• **1 pele = 50 pontos**\n`;
    description += `• **1 carne = 20 pontos**\n\n`;
    description += `${moneybagEmoji} Os 10 melhores caçadores ganham recompensas incríveis!\n\n`;
    description += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    prizes.forEach((prize) => {
        description += `${prize.medal} **${prize.position}º Lugar**\n`;
        description += `${silverCoinEmoji} **${prize.silver.toLocaleString()}** moedas de prata\n`;
        description += `${saloonTokenEmoji} **${prize.tokens}x** tokens do saloon\n`;
        description += `${sparklesEmoji} **${prize.xp.toLocaleString()}** XP\n\n`;
    });
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle(`${trophyEmoji} Prêmios - Evento de Caça`)
        .setDescription(description)
        .setFooter({ text: "Os prêmios são distribuídos automaticamente ao fim do evento" })
        .setTimestamp();
    await interaction.editReply({
        embeds: [embed],
        components: [createEventoSelectMenu()]
    });
}
//# sourceMappingURL=eventoMenus.js.map