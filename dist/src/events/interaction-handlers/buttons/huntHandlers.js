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
exports.handleHuntModeSolo = handleHuntModeSolo;
exports.handleHuntModeDuo = handleHuntModeDuo;
exports.handleDuoHuntAccept = handleDuoHuntAccept;
exports.handleDuoHuntCancel = handleDuoHuntCancel;
exports.handleDuoHuntShoot = handleDuoHuntShoot;
exports.handleDuoHuntSkin = handleDuoHuntSkin;
exports.handleDuoHuntEnd = handleDuoHuntEnd;
exports.handleHuntShootButton = handleHuntShootButton;
const discord_js_1 = require("discord.js");
const huntSessionManager_1 = require("../../../utils/huntSessionManager");
const duoHuntSessionManager_1 = require("../../../utils/duoHuntSessionManager");
const inventoryManager_1 = require("../../../utils/inventoryManager");
const hunt_1 = require("../../../commands/hunting/hunt");
const embeds_1 = require("../../../utils/embeds");
const customEmojis_1 = require("../../../utils/customEmojis");
const eventManager_1 = require("../../../utils/eventManager");
async function handleHuntModeSolo(interaction) {
    const userId = interaction.user.id;
    if (!interaction.customId.endsWith(userId)) {
        await interaction.reply({
            content: "❌ Este botão não é para você!",
            ephemeral: true,
        });
        return;
    }
    await interaction.deferUpdate();
    const { selectAnimal } = await Promise.resolve().then(() => __importStar(require("../../../commands/hunting/hunt")));
    const animal = selectAnimal();
    if (!animal) {
        await interaction.editReply({
            content: "❌ Erro ao procurar animais. Tente novamente!",
            components: [],
        });
        return;
    }
    const session = huntSessionManager_1.huntSessionManager.createSession(userId, interaction.user.username, animal);
    const huntEmbed = new discord_js_1.EmbedBuilder()
        .setColor(animal.rarityColor)
        .setTitle(`${(0, customEmojis_1.getEmoji)("dart")} Expedição de Caça Iniciada!`)
        .setDescription(`Você avistou um animal selvagem nas redondezas do velho oeste!\n\n` +
        `**Animal Encontrado**\n` +
        `**${animal.name}**\n\n` +
        `${(0, customEmojis_1.getEmoji)("star")} **Raridade:** ${animal.rarity}\n` +
        `${(0, customEmojis_1.getEmoji)("dart")} **Precisão Necessária:** ${animal.requiredAccuracy}%\n` +
        `${(0, customEmojis_1.getEmoji)("timer")} **Tentativas Disponíveis:** ${session.maxAttempts}\n` +
        `${(0, customEmojis_1.getEmoji)("sparkles")} **Experiência:** +${animal.experience} XP`)
        .addFields({
        name: `${(0, customEmojis_1.getEmoji)("gift")} Recompensas Possíveis`,
        value: `${animal.rewards.meat ? `🥩 Carne de ${animal.name.split(' ')[0]}\n` : ''}` +
            `${animal.rewards.pelt ? `${(0, customEmojis_1.getEmoji)(animal.rewards.pelt.id.toUpperCase())} Pele de ${animal.name.split(' ')[0]}\n` : ''}` +
            `${animal.rewards.feather ? `🪶 Pena Dourada\n` : ''}`,
        inline: true
    }, {
        name: `${(0, customEmojis_1.getEmoji)("rifle_de_caca")} Equipamento`,
        value: `${(0, customEmojis_1.getEmoji)("check")} Rifle de Caça\n${(0, customEmojis_1.getEmoji)("cowboy")} ${interaction.user.username}`,
        inline: true
    })
        .setImage(animal.imageUrl)
        .setFooter({
        text: `🎯 Você tem ${session.maxAttempts} tentativas para abater este animal. Boa sorte, parceiro!`
    })
        .setTimestamp();
    const shootButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`hunt_shoot_${userId}`)
        .setLabel(`${session.attemptsRemaining}/${session.maxAttempts}`)
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setEmoji("🎯");
    const row = new discord_js_1.ActionRowBuilder().addComponents(shootButton);
    await interaction.editReply({
        embeds: [huntEmbed],
        components: [row],
    });
}
async function handleHuntModeDuo(interaction) {
    const userId = interaction.user.id;
    if (!interaction.customId.endsWith(userId)) {
        await interaction.reply({
            content: "❌ Este botão não é para você!",
            ephemeral: true,
        });
        return;
    }
    await interaction.deferUpdate();
    const selectEmbed = new discord_js_1.EmbedBuilder()
        .setColor("#10b981")
        .setTitle(`${(0, customEmojis_1.getEmoji)("cowboy")} Caçada DUO - Selecione o Parceiro`)
        .setDescription(`Escolha um parceiro para caçar junto!\n\n` +
        `${(0, customEmojis_1.getEmoji)("warning")} **Requisitos:**\n` +
        `• Ambos precisam ter Rifle de Caça\n` +
        `• Parceiro não pode estar em outra caçada\n\n` +
        `${(0, customEmojis_1.getEmoji)("info")} Use o menu abaixo para selecionar o parceiro.`)
        .setImage("https://i.postimg.cc/022T4822/IMG-3476.png")
        .setFooter({ text: "Selecione um usuário no servidor" })
        .setTimestamp();
    const userSelect = new discord_js_1.UserSelectMenuBuilder()
        .setCustomId(`hunt_duo_partner_select_${userId}`)
        .setPlaceholder("Selecione um parceiro...")
        .setMinValues(1)
        .setMaxValues(1);
    const row = new discord_js_1.ActionRowBuilder().addComponents(userSelect);
    await interaction.editReply({
        embeds: [selectEmbed],
        components: [row],
    });
}
async function handleDuoHuntAccept(interaction) {
    const sessionId = interaction.customId.replace("duo_hunt_accept_", "");
    const userId = interaction.user.id;
    await interaction.deferUpdate();
    const session = duoHuntSessionManager_1.duoHuntSessionManager.getSession(sessionId);
    if (!session) {
        await interaction.editReply({
            content: "❌ Este convite expirou!",
            components: [],
        });
        return;
    }
    if (userId !== session.player2.userId) {
        await interaction.followUp({
            content: "❌ Este convite não é para você!",
            ephemeral: true,
        });
        return;
    }
    const rifleCount = (0, inventoryManager_1.getItem)(userId, "rifle_de_caca");
    if (rifleCount === 0) {
        await interaction.editReply({
            content: "❌ Você precisa de um Rifle de Caça para aceitar este convite!",
            components: [],
        });
        duoHuntSessionManager_1.duoHuntSessionManager.endSession(sessionId);
        return;
    }
    const activeSession = duoHuntSessionManager_1.duoHuntSessionManager.acceptInvite(sessionId);
    if (!activeSession) {
        await interaction.editReply({
            content: "❌ Não foi possível aceitar este convite!",
            components: [],
        });
        return;
    }
    const startEmbed = new discord_js_1.EmbedBuilder()
        .setColor("#10b981")
        .setTitle(`${(0, customEmojis_1.getEmoji)("cowboy")} Caçada DUO Iniciada!`)
        .setDescription(`**${activeSession.player1.userName}** e **${activeSession.player2.userName}** começaram uma caçada DUO!\n\n` +
        `${(0, customEmojis_1.getEmoji)("timer")} **Duração:** 10 minutos\n` +
        `${(0, customEmojis_1.getEmoji)("rifle_de_caca")} **Ambos têm rifles**\n` +
        `${(0, customEmojis_1.getEmoji)("gift")} **Animais caçados serão compartilhados**\n\n` +
        `**Barra de Progresso:**\n` +
        `\`░░░░░░░░░░░░░░░░░░░░\` 0%\n\n` +
        `📋 **Histórico de Caça:**\n` +
        `*Nenhum animal caçado ainda...*`)
        .setFooter({ text: "Use os botões abaixo para caçar e esfolar animais!" })
        .setTimestamp();
    const huntButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`duo_hunt_shoot_${sessionId}`)
        .setLabel("Caçar Animal")
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setEmoji("🎯");
    const skinButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`duo_hunt_skin_${sessionId}`)
        .setLabel("Esfolar Animal")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setEmoji("🔪")
        .setDisabled(true);
    const endButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`duo_hunt_end_${sessionId}`)
        .setLabel("Encerrar")
        .setStyle(discord_js_1.ButtonStyle.Danger)
        .setEmoji("🚪");
    const row = new discord_js_1.ActionRowBuilder().addComponents(huntButton, skinButton, endButton);
    await interaction.editReply({
        content: "",
        embeds: [startEmbed],
        components: [row],
    });
    setTimeout(() => {
        checkDuoHuntExpiration(sessionId, interaction);
    }, activeSession.duration);
}
async function handleDuoHuntCancel(interaction) {
    const sessionId = interaction.customId.replace("duo_hunt_cancel_", "");
    await interaction.deferUpdate();
    const session = duoHuntSessionManager_1.duoHuntSessionManager.getSession(sessionId);
    if (session) {
        duoHuntSessionManager_1.duoHuntSessionManager.endSession(sessionId);
    }
    await interaction.editReply({
        content: "❌ Convite de caçada DUO recusado!",
        embeds: [],
        components: [],
    });
}
async function handleDuoHuntShoot(interaction) {
    const sessionId = interaction.customId.replace("duo_hunt_shoot_", "");
    const userId = interaction.user.id;
    await interaction.deferUpdate();
    const session = duoHuntSessionManager_1.duoHuntSessionManager.getSession(sessionId);
    if (!session || session.status !== 'ACTIVE') {
        await interaction.editReply({
            content: "❌ Esta sessão de caça expirou ou não está ativa!",
            components: [],
        });
        return;
    }
    if (userId !== session.player1.userId && userId !== session.player2.userId) {
        await interaction.followUp({
            content: "❌ Você não está nesta caçada!",
            ephemeral: true,
        });
        return;
    }
    const userName = userId === session.player1.userId
        ? session.player1.userName
        : session.player2.userName;
    const reservation = duoHuntSessionManager_1.duoHuntSessionManager.reserveKillSlot(sessionId);
    if (!reservation.reserved) {
        await interaction.followUp({
            content: `⏳ **Aguarde ${reservation.cooldown}s** antes de caçar novamente!\n\nCooldown de 10s após cada abate.`,
            ephemeral: true,
        });
        return;
    }
    const rifleCount = (0, inventoryManager_1.getItem)(userId, "rifle_de_caca");
    if (rifleCount === 0) {
        duoHuntSessionManager_1.duoHuntSessionManager.cancelKillSlot(sessionId);
        await interaction.followUp({
            content: "❌ Você não tem mais um Rifle de Caça!",
            ephemeral: true,
        });
        return;
    }
    const shotAccuracy = (0, hunt_1.calculateShotAccuracy)();
    const animal = (0, hunt_1.selectAnimal)();
    if (!animal) {
        duoHuntSessionManager_1.duoHuntSessionManager.cancelKillSlot(sessionId);
        await interaction.followUp({
            content: "❌ Erro ao procurar animais!",
            ephemeral: true,
        });
        return;
    }
    const huntSuccess = shotAccuracy >= animal.requiredAccuracy;
    if (huntSuccess) {
        await (0, inventoryManager_1.reduceDurability)(userId, "rifle_de_caca", 1);
        const updatedSession = duoHuntSessionManager_1.duoHuntSessionManager.addKill(sessionId, animal.name, userName, animal.rewards);
        if (!updatedSession) {
            await interaction.followUp({
                content: "❌ Erro ao registrar a caça!",
                ephemeral: true,
            });
            return;
        }
        const progress = duoHuntSessionManager_1.duoHuntSessionManager.getProgress(sessionId);
        const remaining = duoHuntSessionManager_1.duoHuntSessionManager.getRemainingTime(sessionId);
        const progressBar = createProgressBarString(progress);
        const killsHistory = updatedSession.kills.slice(-5).map((kill, idx) => {
            const killText = kill.skinnedBy
                ? `✅ **${kill.animalName}** - Matou: ${kill.killedBy} | Esfolou: ${kill.skinnedBy}`
                : `🎯 **${kill.animalName}** - Matou: ${kill.killedBy} | *Aguardando esfolar*`;
            return killText;
        }).join('\n');
        const embed = new discord_js_1.EmbedBuilder()
            .setColor("#10b981")
            .setTitle(`${(0, customEmojis_1.getEmoji)("cowboy")} Caçada DUO em Andamento`)
            .setDescription(`**${session.player1.userName}** e **${session.player2.userName}**\n\n` +
            `${(0, customEmojis_1.getEmoji)("timer")} **Tempo Restante:** ${Math.floor(remaining / 60)}m ${remaining % 60}s\n` +
            `${(0, customEmojis_1.getEmoji)("gift")} **Animais Caçados:** ${updatedSession.totalKills}\n\n` +
            `**Barra de Progresso:**\n` +
            `\`${progressBar}\` ${Math.floor(progress)}%\n\n` +
            `📋 **Últimas Caças:**\n${killsHistory || '*Nenhum animal caçado ainda...*'}`)
            .setFooter({ text: `🎯 ${userName} matou um ${animal.name}!` })
            .setTimestamp();
        const hasUnskinnedAnimals = updatedSession.kills.some(k => !k.skinnedBy);
        const huntButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`duo_hunt_shoot_${sessionId}`)
            .setLabel("Caçar Animal")
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setEmoji("🎯");
        const skinButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`duo_hunt_skin_${sessionId}`)
            .setLabel("Esfolar Animal")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setEmoji("🔪")
            .setDisabled(!hasUnskinnedAnimals);
        const endButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`duo_hunt_end_${sessionId}`)
            .setLabel("Encerrar")
            .setStyle(discord_js_1.ButtonStyle.Danger)
            .setEmoji("🚪");
        const row = new discord_js_1.ActionRowBuilder().addComponents(huntButton, skinButton, endButton);
        await interaction.editReply({
            embeds: [embed],
            components: [row],
        });
    }
    else {
        duoHuntSessionManager_1.duoHuntSessionManager.cancelKillSlot(sessionId);
        await interaction.followUp({
            content: `❌ **${userName}** errou o tiro! Precisão: ${shotAccuracy}% (Necessário: ${animal.requiredAccuracy}%)`,
            ephemeral: true,
        });
    }
}
async function handleDuoHuntSkin(interaction) {
    const sessionId = interaction.customId.replace("duo_hunt_skin_", "");
    const userId = interaction.user.id;
    await interaction.deferUpdate();
    const session = duoHuntSessionManager_1.duoHuntSessionManager.getSession(sessionId);
    if (!session || session.status !== 'ACTIVE') {
        await interaction.editReply({
            content: "❌ Esta sessão de caça expirou!",
            components: [],
        });
        return;
    }
    if (userId !== session.player1.userId && userId !== session.player2.userId) {
        await interaction.followUp({
            content: "❌ Você não está nesta caçada!",
            ephemeral: true,
        });
        return;
    }
    const userName = userId === session.player1.userId
        ? session.player1.userName
        : session.player2.userName;
    const unskinnedIndex = session.kills.findIndex(k => !k.skinnedBy);
    if (unskinnedIndex === -1) {
        await interaction.followUp({
            content: "❌ Não há animais para esfolar!",
            ephemeral: true,
        });
        return;
    }
    const kill = session.kills[unskinnedIndex];
    const player1Inv = (0, inventoryManager_1.getInventory)(session.player1.userId);
    const player2Inv = (0, inventoryManager_1.getInventory)(session.player2.userId);
    const peltReceiver = Math.random() < 0.5 ? 1 : 2;
    const featherReceiver = Math.random() < 0.5 ? 1 : 2;
    let player1Weight = 0;
    let player2Weight = 0;
    if (kill.rewards.meat) {
        const meatWeight = (inventoryManager_1.ITEMS[kill.rewards.meat.id]?.weight || 0);
        player1Weight += meatWeight * Math.ceil(kill.rewards.meat.amount / 2);
        player2Weight += meatWeight * Math.floor(kill.rewards.meat.amount / 2);
    }
    if (kill.rewards.pelt) {
        const peltWeight = (inventoryManager_1.ITEMS[kill.rewards.pelt.id]?.weight || 0) * kill.rewards.pelt.amount;
        if (kill.rewards.pelt.amount === 1) {
            if (peltReceiver === 1) {
                player1Weight += peltWeight;
            }
            else {
                player2Weight += peltWeight;
            }
        }
        else {
            player1Weight += (inventoryManager_1.ITEMS[kill.rewards.pelt.id]?.weight || 0) * Math.ceil(kill.rewards.pelt.amount / 2);
            player2Weight += (inventoryManager_1.ITEMS[kill.rewards.pelt.id]?.weight || 0) * Math.floor(kill.rewards.pelt.amount / 2);
        }
    }
    if (kill.rewards.feather) {
        const featherWeight = (inventoryManager_1.ITEMS[kill.rewards.feather.id]?.weight || 0) * kill.rewards.feather.amount;
        if (kill.rewards.feather.amount === 1) {
            if (featherReceiver === 1) {
                player1Weight += featherWeight;
            }
            else {
                player2Weight += featherWeight;
            }
        }
        else {
            player1Weight += (inventoryManager_1.ITEMS[kill.rewards.feather.id]?.weight || 0) * Math.ceil(kill.rewards.feather.amount / 2);
            player2Weight += (inventoryManager_1.ITEMS[kill.rewards.feather.id]?.weight || 0) * Math.floor(kill.rewards.feather.amount / 2);
        }
    }
    if (player1Inv.weight + player1Weight > player1Inv.maxWeight ||
        player2Inv.weight + player2Weight > player2Inv.maxWeight) {
        await interaction.followUp({
            content: "❌ Um dos jogadores está com a mochila cheia! Libere espaço antes de esfolar.",
            ephemeral: true,
        });
        return;
    }
    if (kill.rewards.meat) {
        await (0, inventoryManager_1.addItem)(session.player1.userId, kill.rewards.meat.id, Math.ceil(kill.rewards.meat.amount / 2));
        await (0, inventoryManager_1.addItem)(session.player2.userId, kill.rewards.meat.id, Math.floor(kill.rewards.meat.amount / 2));
    }
    if (kill.rewards.pelt) {
        if (kill.rewards.pelt.amount === 1) {
            const receiverId = peltReceiver === 1 ? session.player1.userId : session.player2.userId;
            await (0, inventoryManager_1.addItem)(receiverId, kill.rewards.pelt.id, 1);
        }
        else {
            await (0, inventoryManager_1.addItem)(session.player1.userId, kill.rewards.pelt.id, Math.ceil(kill.rewards.pelt.amount / 2));
            await (0, inventoryManager_1.addItem)(session.player2.userId, kill.rewards.pelt.id, Math.floor(kill.rewards.pelt.amount / 2));
        }
    }
    if (kill.rewards.feather) {
        if (kill.rewards.feather.amount === 1) {
            const receiverId = featherReceiver === 1 ? session.player1.userId : session.player2.userId;
            await (0, inventoryManager_1.addItem)(receiverId, kill.rewards.feather.id, 1);
        }
        else {
            await (0, inventoryManager_1.addItem)(session.player1.userId, kill.rewards.feather.id, Math.ceil(kill.rewards.feather.amount / 2));
            await (0, inventoryManager_1.addItem)(session.player2.userId, kill.rewards.feather.id, Math.floor(kill.rewards.feather.amount / 2));
        }
    }
    // Add to hunting event stats for BOTH players in DUO mode
    if (kill.rewards.pelt || kill.rewards.meat) {
        // Calculate pelts and meat for player 1
        let player1Pelts = 0;
        let player1Meat = 0;
        if (kill.rewards.pelt) {
            if (kill.rewards.pelt.amount === 1) {
                player1Pelts = peltReceiver === 1 ? 1 : 0;
            }
            else {
                player1Pelts = Math.ceil(kill.rewards.pelt.amount / 2);
            }
        }
        if (kill.rewards.meat) {
            player1Meat = Math.ceil(kill.rewards.meat.amount / 2);
        }
        // Calculate pelts and meat for player 2
        let player2Pelts = 0;
        let player2Meat = 0;
        if (kill.rewards.pelt) {
            if (kill.rewards.pelt.amount === 1) {
                player2Pelts = peltReceiver === 2 ? 1 : 0;
            }
            else {
                player2Pelts = Math.floor(kill.rewards.pelt.amount / 2);
            }
        }
        if (kill.rewards.meat) {
            player2Meat = Math.floor(kill.rewards.meat.amount / 2);
        }
        // Add event stats for both players
        (0, eventManager_1.addHuntingEventStats)(session.player1.userId, session.player1.userName, player1Pelts, player1Meat, kill.animalName);
        (0, eventManager_1.addHuntingEventStats)(session.player2.userId, session.player2.userName, player2Pelts, player2Meat, kill.animalName);
    }
    const updatedSession = duoHuntSessionManager_1.duoHuntSessionManager.addSkin(sessionId, unskinnedIndex, userName);
    if (!updatedSession) {
        await interaction.followUp({
            content: "❌ Erro ao esfolar animal!",
            ephemeral: true,
        });
        return;
    }
    const progress = duoHuntSessionManager_1.duoHuntSessionManager.getProgress(sessionId);
    const remaining = duoHuntSessionManager_1.duoHuntSessionManager.getRemainingTime(sessionId);
    const progressBar = createProgressBarString(progress);
    const killsHistory = updatedSession.kills.slice(-5).map(k => {
        const killText = k.skinnedBy
            ? `✅ **${k.animalName}** - Matou: ${k.killedBy} | Esfolou: ${k.skinnedBy}`
            : `🎯 **${k.animalName}** - Matou: ${k.killedBy} | *Aguardando esfolar*`;
        return killText;
    }).join('\n');
    const embed = new discord_js_1.EmbedBuilder()
        .setColor("#10b981")
        .setTitle(`${(0, customEmojis_1.getEmoji)("cowboy")} Caçada DUO em Andamento`)
        .setDescription(`**${session.player1.userName}** e **${session.player2.userName}**\n\n` +
        `${(0, customEmojis_1.getEmoji)("timer")} **Tempo Restante:** ${Math.floor(remaining / 60)}m ${remaining % 60}s\n` +
        `${(0, customEmojis_1.getEmoji)("gift")} **Animais Caçados:** ${updatedSession.totalKills}\n\n` +
        `**Barra de Progresso:**\n` +
        `\`${progressBar}\` ${Math.floor(progress)}%\n\n` +
        `📋 **Últimas Caças:**\n${killsHistory}`)
        .setFooter({ text: `🔪 ${userName} esfolou o ${kill.animalName}!` })
        .setTimestamp();
    const hasUnskinnedAnimals = updatedSession.kills.some(k => !k.skinnedBy);
    const huntButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`duo_hunt_shoot_${sessionId}`)
        .setLabel("Caçar Animal")
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setEmoji("🎯");
    const skinButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`duo_hunt_skin_${sessionId}`)
        .setLabel("Esfolar Animal")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setEmoji("🔪")
        .setDisabled(!hasUnskinnedAnimals);
    const endButton = new discord_js_1.ButtonBuilder()
        .setCustomId(`duo_hunt_end_${sessionId}`)
        .setLabel("Encerrar")
        .setStyle(discord_js_1.ButtonStyle.Danger)
        .setEmoji("🚪");
    const row = new discord_js_1.ActionRowBuilder().addComponents(huntButton, skinButton, endButton);
    await interaction.editReply({
        embeds: [embed],
        components: [row],
    });
}
async function handleDuoHuntEnd(interaction) {
    const sessionId = interaction.customId.replace("duo_hunt_end_", "");
    await interaction.deferUpdate();
    const session = duoHuntSessionManager_1.duoHuntSessionManager.getSession(sessionId);
    if (!session) {
        await interaction.editReply({
            content: "❌ Esta sessão já foi encerrada!",
            components: [],
        });
        return;
    }
    const summaryEmbed = new discord_js_1.EmbedBuilder()
        .setColor("#f59e0b")
        .setTitle(`${(0, customEmojis_1.getEmoji)("check")} Caçada DUO Finalizada!`)
        .setDescription(`**${session.player1.userName}** e **${session.player2.userName}**\n\n` +
        `${(0, customEmojis_1.getEmoji)("gift")} **Total de Animais Caçados:** ${session.totalKills}\n\n` +
        `📋 **Resumo da Caçada:**\n` +
        session.kills.map(k => `• **${k.animalName}** - Matou: ${k.killedBy}${k.skinnedBy ? ` | Esfolou: ${k.skinnedBy}` : ''}`).join('\n'))
        .setFooter({ text: "Ótima caçada, parceiros!" })
        .setTimestamp();
    duoHuntSessionManager_1.duoHuntSessionManager.endSession(sessionId);
    await interaction.editReply({
        embeds: [summaryEmbed],
        components: [],
    });
}
async function checkDuoHuntExpiration(sessionId, interaction) {
    const session = duoHuntSessionManager_1.duoHuntSessionManager.getSession(sessionId);
    if (!session)
        return;
    const summaryEmbed = new discord_js_1.EmbedBuilder()
        .setColor("#dc2626")
        .setTitle(`${(0, customEmojis_1.getEmoji)("timer")} Tempo Esgotado!`)
        .setDescription(`A caçada DUO de **${session.player1.userName}** e **${session.player2.userName}** terminou!\n\n` +
        `${(0, customEmojis_1.getEmoji)("gift")} **Total de Animais Caçados:** ${session.totalKills}\n\n` +
        `📋 **Resumo da Caçada:**\n` +
        (session.kills.length > 0
            ? session.kills.map(k => `• **${k.animalName}** - Matou: ${k.killedBy}${k.skinnedBy ? ` | Esfolou: ${k.skinnedBy}` : ''}`).join('\n')
            : '*Nenhum animal foi caçado...*'))
        .setFooter({ text: "A caçada durou 10 minutos!" })
        .setTimestamp();
    duoHuntSessionManager_1.duoHuntSessionManager.endSession(sessionId);
    try {
        await interaction.editReply({
            embeds: [summaryEmbed],
            components: [],
        });
    }
    catch (error) {
        console.error("Error updating duo hunt expiration:", error);
    }
}
function createProgressBarString(percentage, length = 20) {
    const filledBlocks = Math.floor((percentage / 100) * length);
    const emptyBlocks = length - filledBlocks;
    return "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);
}
async function handleHuntShootButton(interaction) {
    const userId = interaction.user.id;
    // Check if button belongs to this user
    if (!interaction.customId.endsWith(userId)) {
        await interaction.reply({
            content: "❌ Este botão não é para você!",
            ephemeral: true,
        });
        return;
    }
    await interaction.deferUpdate();
    // Get hunt session
    const session = huntSessionManager_1.huntSessionManager.getSession(userId);
    if (!session) {
        await interaction.editReply({
            content: "❌ Sua sessão de caça expirou! Use `/hunt` novamente para começar uma nova caçada.",
            components: [],
        });
        return;
    }
    // Calculate shot accuracy
    const shotAccuracy = (0, hunt_1.calculateShotAccuracy)();
    // Record shot
    huntSessionManager_1.huntSessionManager.recordShot(userId, shotAccuracy);
    // Check if hit
    const huntSuccess = shotAccuracy >= session.animalRequiredAccuracy;
    if (huntSuccess) {
        // Success - give rewards
        const inventory = (0, inventoryManager_1.getInventory)(userId);
        const rewardsText = [];
        // Calculate total weight of all rewards
        let totalRewardWeight = 0;
        if (session.animalRewards.meat) {
            const meatData = inventoryManager_1.ITEMS[session.animalRewards.meat.id];
            if (meatData) {
                totalRewardWeight +=
                    meatData.weight * session.animalRewards.meat.amount;
            }
        }
        if (session.animalRewards.pelt) {
            const peltData = inventoryManager_1.ITEMS[session.animalRewards.pelt.id];
            if (peltData) {
                totalRewardWeight +=
                    peltData.weight * session.animalRewards.pelt.amount;
            }
        }
        if (session.animalRewards.feather) {
            const featherData = inventoryManager_1.ITEMS[session.animalRewards.feather.id];
            if (featherData) {
                totalRewardWeight +=
                    featherData.weight * session.animalRewards.feather.amount;
            }
        }
        // Check if all rewards fit in inventory
        if (inventory.weight + totalRewardWeight > inventory.maxWeight) {
            const embed = (0, embeds_1.warningEmbed)("🎒 Mochila Cheia!", `Você caçou um **${session.animalName}** mas sua mochila está cheia demais!\n\n` +
                `**Peso Atual:** ${inventory.weight.toFixed(2)}/${inventory.maxWeight}\n` +
                `**Peso das Recompensas:** ${totalRewardWeight.toFixed(2)}\n` +
                `**Total:** ${(inventory.weight + totalRewardWeight).toFixed(2)}/${inventory.maxWeight}\n\n` +
                "Libere espaço e tente novamente.", "Espaço insuficiente no inventário").setImage(null);
            huntSessionManager_1.huntSessionManager.endSession(userId);
            await interaction.editReply({ embeds: [embed], components: [] });
            return;
        }
        // Add rewards
        if (session.animalRewards.meat) {
            await (0, inventoryManager_1.addItem)(userId, session.animalRewards.meat.id, session.animalRewards.meat.amount);
            rewardsText.push(`🥩 ${inventoryManager_1.ITEMS[session.animalRewards.meat.id].name} x${session.animalRewards.meat.amount}`);
        }
        if (session.animalRewards.pelt) {
            await (0, inventoryManager_1.addItem)(userId, session.animalRewards.pelt.id, session.animalRewards.pelt.amount);
            rewardsText.push(`${(0, customEmojis_1.getEmoji)(session.animalRewards.pelt.id.toUpperCase())} ${inventoryManager_1.ITEMS[session.animalRewards.pelt.id].name} x${session.animalRewards.pelt.amount}`);
        }
        if (session.animalRewards.feather) {
            await (0, inventoryManager_1.addItem)(userId, session.animalRewards.feather.id, session.animalRewards.feather.amount);
            rewardsText.push(`🪶 ${inventoryManager_1.ITEMS[session.animalRewards.feather.id].name} x${session.animalRewards.feather.amount}`);
        }
        // Reduce rifle durability
        const durabilityResult = await (0, inventoryManager_1.reduceDurability)(userId, "rifle_de_caca", 1);
        // Add to hunting event if active
        const peltsCollected = session.animalRewards.pelt ? session.animalRewards.pelt.amount : 0;
        const meatCollected = session.animalRewards.meat ? session.animalRewards.meat.amount : 0;
        (0, eventManager_1.addHuntingEventStats)(userId, interaction.user.username, peltsCollected, meatCollected, session.animalName);
        // Create success embed
        const successEmbed = new discord_js_1.EmbedBuilder()
            .setColor(session.animalRarityColor)
            .setTitle(`${(0, customEmojis_1.getEmoji)("check")} Caçada Bem-sucedida!`)
            .setDescription(`Excelente tiro, parceiro! Você abateu um **${session.animalName}**!\n\n` +
            `${(0, customEmojis_1.getEmoji)("star")} **Raridade:** ${session.animalRarity}\n` +
            `${(0, customEmojis_1.getEmoji)("dart")} **Precisão do Tiro:** ${shotAccuracy}%\n` +
            `${(0, customEmojis_1.getEmoji)("timer")} **Tentativa:** ${session.maxAttempts - session.attemptsRemaining}/${session.maxAttempts}\n` +
            `${(0, customEmojis_1.getEmoji)("sparkles")} **XP Ganho:** +${session.animalExperience} XP`)
            .addFields({
            name: `${(0, customEmojis_1.getEmoji)("gift")} Recompensas Obtidas`,
            value: rewardsText.join('\n'),
            inline: true
        }, {
            name: `${(0, customEmojis_1.getEmoji)("rifle_de_caca")} Equipamento`,
            value: durabilityResult.broken
                ? `${(0, customEmojis_1.getEmoji)("cross")} Rifle Quebrado!\n${(0, customEmojis_1.getEmoji)("warning")} Compre outro na armaria`
                : `${(0, customEmojis_1.getEmoji)("check")} Durabilidade: ${durabilityResult.durability}/${inventoryManager_1.ITEMS.rifle_de_caca.maxDurability}`,
            inline: true
        })
            .setImage(null)
            .setFooter({
            text: `🎯 Caçador: ${session.userName} | Velho Oeste`
        })
            .setTimestamp();
        // End session
        huntSessionManager_1.huntSessionManager.endSession(userId);
        await interaction.editReply({
            embeds: [successEmbed],
            components: [],
        });
    }
    else {
        // Missed shot
        if (session.attemptsRemaining === 0) {
            // No more attempts - hunt failed
            // Reduce rifle durability
            const durabilityResult = await (0, inventoryManager_1.reduceDurability)(userId, "rifle_de_caca", 1);
            // Create failed embed
            const failedEmbed = new discord_js_1.EmbedBuilder()
                .setColor("#dc2626")
                .setTitle(`${(0, customEmojis_1.getEmoji)("dust")} O Animal Escapou!`)
                .setDescription(`Que pena, parceiro! O **${session.animalName}** fugiu para as montanhas...\n\n` +
                `${(0, customEmojis_1.getEmoji)("cross")} **Tentativas Esgotadas:** ${session.maxAttempts}/${session.maxAttempts}\n` +
                `${(0, customEmojis_1.getEmoji)("dart")} **Melhor Precisão:** ${session.bestAccuracy}%\n` +
                `${(0, customEmojis_1.getEmoji)("warning")} **Precisão Necessária:** ${session.animalRequiredAccuracy}%\n` +
                `${(0, customEmojis_1.getEmoji)("star")} **Raridade:** ${session.animalRarity}`)
                .addFields({
                name: `${(0, customEmojis_1.getEmoji)("stats")} Histórico de Tiros`,
                value: session.shotHistory.map((shot, index) => `Tentativa ${index + 1}: ${shot}%`).join('\n'),
                inline: true
            }, {
                name: `${(0, customEmojis_1.getEmoji)("rifle_de_caca")} Equipamento`,
                value: durabilityResult.broken
                    ? `${(0, customEmojis_1.getEmoji)("cross")} Rifle Quebrado!\n${(0, customEmojis_1.getEmoji)("warning")} Compre outro na armaria`
                    : `${(0, customEmojis_1.getEmoji)("check")} Durabilidade: ${durabilityResult.durability}/${inventoryManager_1.ITEMS.rifle_de_caca.maxDurability}`,
                inline: true
            })
                .setImage(null)
                .setFooter({
                text: `💨 Mais sorte na próxima caçada! Use /hunt para tentar novamente`
            })
                .setTimestamp();
            huntSessionManager_1.huntSessionManager.endSession(userId);
            await interaction.editReply({
                embeds: [failedEmbed],
                components: [],
            });
        }
        else {
            // Still have attempts left
            const shootButton = new discord_js_1.ButtonBuilder()
                .setCustomId(`hunt_shoot_${userId}`)
                .setLabel(`${session.attemptsRemaining}/${session.maxAttempts}`)
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setEmoji("🎯");
            const row = new discord_js_1.ActionRowBuilder().addComponents(shootButton);
            // Create miss embed
            const missEmbed = new discord_js_1.EmbedBuilder()
                .setColor("#f59e0b")
                .setTitle(`${(0, customEmojis_1.getEmoji)("cross")} Tiro Errado!`)
                .setDescription(`Quase lá, parceiro! O **${session.animalName}** ainda está por perto.\n\n` +
                `${(0, customEmojis_1.getEmoji)("cross")} **Sua Precisão:** ${shotAccuracy}%\n` +
                `${(0, customEmojis_1.getEmoji)("dart")} **Precisão Necessária:** ${session.animalRequiredAccuracy}%\n` +
                `${(0, customEmojis_1.getEmoji)("timer")} **Tentativas Restantes:** ${session.attemptsRemaining}/${session.maxAttempts}\n` +
                `${(0, customEmojis_1.getEmoji)("sparkles")} **Melhor Precisão:** ${session.bestAccuracy}%`)
                .addFields({
                name: `${(0, customEmojis_1.getEmoji)("info")} Dica`,
                value: `Respire fundo e tente novamente! Quanto mais você pratica, melhor fica sua pontaria.`,
                inline: false
            })
                .setImage(null)
                .setFooter({
                text: `🎯 Continue tentando! Clique no botão abaixo para atirar novamente`
            })
                .setTimestamp();
            await interaction.editReply({
                embeds: [missEmbed],
                components: [row],
            });
        }
    }
}
//# sourceMappingURL=huntHandlers.js.map