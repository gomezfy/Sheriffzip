"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFishLeft = handleFishLeft;
exports.handleFishRight = handleFishRight;
exports.handleFishCatch = handleFishCatch;
exports.handleFishSelectBait = handleFishSelectBait;
exports.handleSelectBaitEquip = handleSelectBaitEquip;
const discord_js_1 = require("discord.js");
const fishingSessionManager_1 = require("../../../utils/fishingSessionManager");
const inventoryManager_1 = require("../../../utils/inventoryManager");
const xpManager_1 = require("../../../utils/xpManager");
const customEmojis_1 = require("../../../utils/customEmojis");
const embeds_1 = require("../../../utils/embeds");
const transactionLock_1 = require("../../../utils/transactionLock");
const fish_1 = require("../../../commands/fishing/fish");
// Mensagens imersivas de sucesso
const SUCCESS_MESSAGES = [
    "O peixe puxou! Mantendo a linha firme...",
    "Boa! O peixe entrou na zona! Aguente firme!",
    "Acerto! O peixe está resistindo!",
    "Perfeito! O peixe se mexeu na zona!",
    "Excelente timing! O peixe avançou!",
    "Fisga perfeita! O peixe sacode a cauda!",
];
// Mensagens imersivas de erro
const FAILURE_MESSAGES = [
    "O peixe escapou pela zona! Tente mover mais rápido!",
    "O peixe se livrou! Melhor sorte na próxima!",
    "Errou de novo! O peixe está ficando desconfiado...",
    "O peixe fugiu da zona! Continue tentando!",
    "O peixe correu! Tente novamente!",
];
// Mensagens quando o peixe escapa
const ESCAPE_MESSAGES = [
    "O peixe foi mais rápido! Conseguiu escapar da vara!",
    "SPLASH! O peixe fez um grande salto e desapareceu!",
    "Ops! O peixe cortou a linha e fugiu para o fundo!",
    "O peixe teve força demais e conseguiu se soltar!",
    "O peixe mergulhou fundo e desapareceu! Que peixe esperto!",
];
// Mensagens quando captura o peixe
const CAPTURE_MESSAGES = [
    "PUXÃO FINAL! Você conseguiu pegar o peixe!",
    "VENCEU! O peixe está na sua mão!",
    "INCRÍVEL! Você dominou o peixe!",
    "ÉPICO! A vara resistiu e você capturou!",
    "SUCESSO! O peixe está capturado!",
];
function getRandomMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)];
}
// Determina o artigo correto para o nome do peixe
function getArticle(fishName) {
    const feminineFishes = ["Truta Prateada", "Águia Dourada"];
    if (feminineFishes.includes(fishName)) {
        return "A";
    }
    return "O";
}
// Substitui "peixe" pela forma correta com artigo
function replaceFishName(message, fishName) {
    const article = getArticle(fishName);
    return message
        .replace(/O peixe/gi, `${article} ${fishName}`)
        .replace(/peixe/gi, fishName);
}
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
        const article = getArticle(session.fishName);
        const captureMessage = replaceFishName(getRandomMessage(CAPTURE_MESSAGES), session.fishName);
        await transactionLock_1.transactionLock.withLock(userId, async () => {
            (0, inventoryManager_1.addItem)(userId, fishItem.id, fishItem.amount);
            (0, inventoryManager_1.reduceDurability)(userId, "fishing_rod", 1);
            (0, xpManager_1.addXp)(userId, session.fishExperience);
        });
        const successEmb = new discord_js_1.EmbedBuilder()
            .setColor("#00ff00")
            .setTitle(`${(0, customEmojis_1.getEmoji)("trophy")} ${article} ${session.fishName} Capturado!`)
            .setDescription(`${captureMessage}!\n\n` +
            `${(0, customEmojis_1.getEmoji)("check")} Você pescou ${article.toLowerCase()} **${session.fishName}**! ${session.fishEmoji}\n\n` +
            `**${(0, customEmojis_1.getEmoji)("gift")} Recompensas:**\n` +
            `${session.fishEmoji} ${session.fishName} x${fishItem.amount}\n` +
            `${(0, customEmojis_1.getEmoji)("star")} +${session.fishExperience} XP\n\n` +
            `**${(0, customEmojis_1.getEmoji)("stats")} Estatísticas:**\n` +
            `${(0, customEmojis_1.getEmoji)("check")} Acertos na zona: ${session.successfulCatches}/${session.requiredCatches}\n` +
            `${(0, customEmojis_1.getEmoji)("timer")} Tentativas usadas: ${session.maxAttempts - session.attemptsRemaining}/${session.maxAttempts}\n\n` +
            `${(0, customEmojis_1.getEmoji)("moneybag")} Use \`/hunterstore\` para vender seus peixes!`)
            .setFooter({ text: "Ótima pescaria!" })
            .setTimestamp();
        fishingSessionManager_1.fishingSessionManager.endSession(userId);
        await interaction.editReply({ embeds: [successEmb], components: [] });
        return;
    }
    // Verificar se perdeu
    if (fishingSessionManager_1.fishingSessionManager.hasLost(userId)) {
        // DERROTA - Ficou sem tentativas
        const article = getArticle(session.fishName);
        const escapeMessage = replaceFishName(getRandomMessage(ESCAPE_MESSAGES), session.fishName);
        const lostEmbed = new discord_js_1.EmbedBuilder()
            .setColor("#ef4444")
            .setTitle(`${(0, customEmojis_1.getEmoji)("cancel")} ${article} ${session.fishName} Escapou!`)
            .setDescription(`${escapeMessage}!\n\n` +
            `${(0, customEmojis_1.getEmoji)("warning")} Infelizmente, você não conseguiu acertar a zona verde o suficiente.\n\n` +
            `**${(0, customEmojis_1.getEmoji)("stats")} Estatísticas Finais:**\n` +
            `${(0, customEmojis_1.getEmoji)("check")} Acertos: ${session.successfulCatches}/${session.requiredCatches}\n` +
            `${(0, customEmojis_1.getEmoji)("cross")} Faltaram: ${session.requiredCatches - session.successfulCatches} acertos\n\n` +
            `${(0, customEmojis_1.getEmoji)("info")} Tente novamente com \`/fish\`!`)
            .setFooter({ text: `${(0, customEmojis_1.getEmoji)("dart")} Dica: Fique atento ao movimento da barra e time seus cliques!` })
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
            const successMsg = replaceFishName(getRandomMessage(SUCCESS_MESSAGES), session.fishName);
            feedbackText = `\n${successMsg}\n**Acertos:** ${session.successfulCatches}/${session.requiredCatches}`;
        }
        else {
            const failMsg = replaceFishName(getRandomMessage(FAILURE_MESSAGES), session.fishName);
            feedbackText = `\n${failMsg}`;
        }
    }
    const fishEmbed = new discord_js_1.EmbedBuilder()
        .setColor(session.fishRarityColor)
        .setTitle(`${(0, customEmojis_1.getEmoji)("dart")} Pescando: ${session.fishName}`)
        .setDescription(`${session.fishEmoji} **${session.fishName}** (${session.fishRarity})\n` +
        `${(0, customEmojis_1.getEmoji)("lightning")} Dificuldade: ${"🔥".repeat(session.fishDifficulty)}\n\n` +
        `**Barra de Posição:**\n\`\`\`${bar}\`\`\`${feedbackText}\n\n` +
        `**${(0, customEmojis_1.getEmoji)("info")} Dica:** Mantenha o 🎣 na zona verde 🟢 e pressione ${(0, customEmojis_1.getEmoji)("check")} PEGAR!`)
        .addFields({
        name: `${(0, customEmojis_1.getEmoji)("timer")} Status`,
        value: `${(0, customEmojis_1.getEmoji)("clock")} Tentativas: ${session.attemptsRemaining}/${session.maxAttempts}\n${(0, customEmojis_1.getEmoji)("check")} Acertos: ${session.successfulCatches}/${session.requiredCatches}`,
        inline: true
    }, {
        name: `${(0, customEmojis_1.getEmoji)("gift")} Progresso`,
        value: `${(0, customEmojis_1.getEmoji)("dart")} Faltam: ${session.requiredCatches - session.successfulCatches} acertos\n${(0, customEmojis_1.getEmoji)("stats")} ${Math.floor((session.successfulCatches / session.requiredCatches) * 100)}% completo`,
        inline: true
    })
        .setFooter({
        text: `${(0, customEmojis_1.getEmoji)("fishing_rod")} Use < e > para mover, depois pressione Fisgar quando estiver na zona verde!`
    })
        .setTimestamp();
    const leftButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`fish_left_${userId}`)
        .setLabel("<")
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    const rightButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`fish_right_${userId}`)
        .setLabel(">")
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    const catchButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`fish_catch_${userId}`)
        .setLabel("Fisgar")
        .setStyle(discord_js_1.ButtonStyle.Success);
    const row = new discord_js_1.ActionRowBuilder().addComponents(leftButton, catchButton, rightButton);
    await interaction.editReply({
        embeds: [fishEmbed],
        components: [row],
    });
}
/**
 * Handler para menu de seleção de isca
 */
async function handleFishSelectBait(interaction) {
    const selectedBait = interaction.values[0];
    const usePremiumBait = selectedBait === "premium";
    await startFishingWithBait(interaction, usePremiumBait);
}
/**
 * Inicia a pesca com a isca selecionada
 */
async function startFishingWithBait(interaction, usePremiumBait) {
    const userId = interaction.user.id;
    await interaction.deferUpdate();
    // Verify user still has the selected bait
    const basicBaitCount = (0, inventoryManager_1.getItem)(userId, "basic_bait");
    const premiumBaitCount = (0, inventoryManager_1.getItem)(userId, "premium_bait");
    if (usePremiumBait && premiumBaitCount === 0) {
        const embed = (0, embeds_1.errorEmbed)(`${(0, customEmojis_1.getEmoji)("cancel")} Isca Premium Indisponível`, "Você não tem mais Isca Premium disponível!");
        await interaction.editReply({ embeds: [embed], components: [] });
        return;
    }
    if (!usePremiumBait && basicBaitCount === 0) {
        const embed = (0, embeds_1.errorEmbed)(`${(0, customEmojis_1.getEmoji)("cancel")} Isca Básica Indisponível`, "Você não tem mais Isca Básica disponível!");
        await interaction.editReply({ embeds: [embed], components: [] });
        return;
    }
    // Check if user already has an active fishing session
    const existingSession = fishingSessionManager_1.fishingSessionManager.getSession(userId);
    if (existingSession) {
        const embed = (0, embeds_1.errorEmbed)(`${(0, customEmojis_1.getEmoji)("fishing_rod")} Pesca em Andamento`, `Você já está pescando um **${existingSession.fishName}**!`);
        await interaction.editReply({ embeds: [embed], components: [] });
        return;
    }
    // Select a random fish
    const fish = (0, fish_1.selectFish)(usePremiumBait);
    if (!fish) {
        const embed = (0, embeds_1.errorEmbed)("❌ Erro na Pesca", "Ocorreu um erro ao procurar peixes. Tente novamente!");
        await interaction.editReply({ embeds: [embed], components: [] });
        return;
    }
    // Consume 1 bait
    if (usePremiumBait) {
        await (0, inventoryManager_1.removeItem)(userId, "premium_bait", 1);
    }
    else {
        await (0, inventoryManager_1.removeItem)(userId, "basic_bait", 1);
    }
    // Create fishing session
    const session = fishingSessionManager_1.fishingSessionManager.createSession(userId, interaction.user.username, fish);
    // Generate initial bar
    const bar = fishingSessionManager_1.fishingSessionManager.generateBar(userId);
    const baitUsed = usePremiumBait ? `${(0, customEmojis_1.getEmoji)("premium_bait")} Isca Premium` : `${(0, customEmojis_1.getEmoji)("basic_bait")} Isca Básica`;
    const baitBonus = usePremiumBait ? `\n${(0, customEmojis_1.getEmoji)("sparkles")} **Bônus de Isca Premium ativo!** Mais chances de peixes raros!` : "";
    const fishEmbed = new discord_js_1.EmbedBuilder()
        .setColor(fish.rarityColor)
        .setTitle(`${(0, customEmojis_1.getEmoji)("dart")} Pesca Iniciada!`)
        .setDescription(`Você lançou sua linha com ${baitUsed} e fisgou algo!${baitBonus}\n\n` +
        `**Peixe Fisgado**\n` +
        `${fish.emoji} **${fish.name}**\n\n` +
        `${(0, customEmojis_1.getEmoji)("star")} **Raridade:** ${fish.rarity}\n` +
        `${(0, customEmojis_1.getEmoji)("lightning")} **Dificuldade:** ${"🔥".repeat(fish.difficulty)}\n` +
        `${(0, customEmojis_1.getEmoji)("check")} **Acertos Necessários:** ${fish.requiredCatches}\n\n` +
        `**${(0, customEmojis_1.getEmoji)("info")} COMO JOGAR:**\n` +
        `Use os botões < e > para manter o 🎣 na zona verde 🟢!\n` +
        `Acerte a zona ${fish.requiredCatches} vezes para pegar o peixe!\n\n` +
        `**Barra de Posição:**\n\`\`\`${bar}\`\`\``)
        .addFields({
        name: `${(0, customEmojis_1.getEmoji)("timer")} Status`,
        value: `${(0, customEmojis_1.getEmoji)("clock")} Tentativas: ${session.attemptsRemaining}/${session.maxAttempts}\n${(0, customEmojis_1.getEmoji)("check")} Acertos: ${session.successfulCatches}/${session.requiredCatches}`,
        inline: true
    }, {
        name: `${(0, customEmojis_1.getEmoji)("gift")} Recompensas`,
        value: `${fish.emoji} ${fish.name}\n${(0, customEmojis_1.getEmoji)("star")} +${fish.experience} XP`,
        inline: true
    })
        .setFooter({
        text: `${(0, customEmojis_1.getEmoji)("fishing_rod")} Mantenha o 🎣 na zona verde 🟢 e pressione os botões no momento certo!`
    })
        .setTimestamp();
    const leftButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`fish_left_${userId}`)
        .setLabel("<")
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    const rightButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`fish_right_${userId}`)
        .setLabel(">")
        .setStyle(discord_js_1.ButtonStyle.Secondary);
    const catchButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`fish_catch_${userId}`)
        .setLabel("Fisgar")
        .setStyle(discord_js_1.ButtonStyle.Success);
    const row = new discord_js_1.ActionRowBuilder().addComponents(leftButton, catchButton, rightButton);
    await interaction.editReply({
        embeds: [fishEmbed],
        components: [row]
    });
}
/**
 * Handler para seleção de isca equipada (do comando /iscar)
 */
async function handleSelectBaitEquip(interaction) {
    const selectedBait = interaction.values[0];
    const { setEquippedBait } = await Promise.resolve().then(() => __importStar(require("../../../commands/fishing/iscar")));
    setEquippedBait(interaction.user.id, selectedBait);
    const baitName = selectedBait === "premium" ? "Isca Premium" : "Isca Básica";
    const baitEmoji = selectedBait === "premium" ? (0, customEmojis_1.getEmoji)("premium_bait") : (0, customEmojis_1.getEmoji)("basic_bait");
    const confirmEmbed = new discord_js_1.EmbedBuilder()
        .setColor("#00ff00")
        .setTitle(`${(0, customEmojis_1.getEmoji)("check")} Isca Equipada!`)
        .setDescription(`${baitEmoji} **${baitName}** foi equipada com sucesso!\n\n` +
        `${(0, customEmojis_1.getEmoji)("fishing_rod")} Use \`/fish\` para começar a pescar!`)
        .setTimestamp();
    await interaction.update({ embeds: [confirmEmbed], components: [] });
}
//# sourceMappingURL=fishingHandlers.js.map