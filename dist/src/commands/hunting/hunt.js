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
exports.ANIMALS = void 0;
exports.selectAnimal = selectAnimal;
exports.calculateShotAccuracy = calculateShotAccuracy;
const discord_js_1 = require("discord.js");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
const embeds_1 = require("../../utils/embeds");
const inventoryManager_1 = require("../../utils/inventoryManager");
const huntSessionManager_1 = require("../../utils/huntSessionManager");
const customEmojis_1 = require("../../utils/customEmojis");
const ANIMALS = [
    {
        name: "Coelho Selvagem",
        emoji: (0, customEmojis_1.getEmoji)("rabbit_pelt"),
        rarity: "COMUM",
        rarityColor: "#808080",
        chance: 40,
        rewards: {
            meat: { id: "rabbit_meat", amount: 1 },
            pelt: { id: "rabbit_pelt", amount: 1 },
        },
        experience: 25,
        requiredAccuracy: 50,
        imageUrl: "https://i.postimg.cc/B6dMtk6W/IMG-3472.png",
    },
    {
        name: "Cervo Majestoso",
        emoji: (0, customEmojis_1.getEmoji)("deer_pelt"),
        rarity: "INCOMUM",
        rarityColor: "#4ade80",
        chance: 25,
        rewards: {
            meat: { id: "deer_meat", amount: 2 },
            pelt: { id: "deer_pelt", amount: 1 },
        },
        experience: 50,
        requiredAccuracy: 60,
        imageUrl: "https://i.postimg.cc/yxmXxNtH/IMG-3470.png",
    },
    {
        name: "Lobo Cinzento",
        emoji: (0, customEmojis_1.getEmoji)("wolf_pelt"),
        rarity: "RARO",
        rarityColor: "#3b82f6",
        chance: 15,
        rewards: {
            meat: { id: "wolf_meat", amount: 1 },
            pelt: { id: "wolf_pelt", amount: 1 },
        },
        experience: 75,
        requiredAccuracy: 70,
        imageUrl: "https://i.postimg.cc/dtJGnwgH/IMG-3468.png",
    },
    {
        name: "Bisão Americano",
        emoji: (0, customEmojis_1.getEmoji)("bison_pelt"),
        rarity: "ÉPICO",
        rarityColor: "#a855f7",
        chance: 10,
        rewards: {
            meat: { id: "bison_meat", amount: 3 },
            pelt: { id: "bison_pelt", amount: 1 },
        },
        experience: 125,
        requiredAccuracy: 75,
        imageUrl: "https://i.postimg.cc/ZqW83H2c/IMG-3469.png",
    },
    {
        name: "Urso Pardo",
        emoji: (0, customEmojis_1.getEmoji)("bear_pelt"),
        rarity: "LENDÁRIO",
        rarityColor: "#f59e0b",
        chance: 7,
        rewards: {
            meat: { id: "bear_meat", amount: 3 },
            pelt: { id: "bear_pelt", amount: 1 },
        },
        experience: 200,
        requiredAccuracy: 85,
        imageUrl: "https://i.postimg.cc/2SzTq4zR/IMG-3471.png",
    },
    {
        name: "Águia Dourada",
        emoji: "🦅",
        rarity: "MÍTICO",
        rarityColor: "#d4af37",
        chance: 3,
        rewards: {
            meat: { id: "rabbit_meat", amount: 1 },
            feather: { id: "eagle_feather", amount: 1 },
        },
        experience: 300,
        requiredAccuracy: 95,
        imageUrl: "https://i.postimg.cc/ncd9k7v6/IMG-3467.png",
    },
];
exports.ANIMALS = ANIMALS;
function selectAnimal() {
    const roll = Math.random() * 100;
    let cumulative = 0;
    for (const animal of ANIMALS) {
        cumulative += animal.chance;
        if (roll <= cumulative) {
            return animal;
        }
    }
    return null;
}
function calculateShotAccuracy() {
    // Simulates shot accuracy (60-100%)
    return Math.floor(Math.random() * 40) + 60;
}
exports.default = {
    data: (0, commandLocalizations_1.applyLocalizations)(new discord_js_1.SlashCommandBuilder()
        .setName("hunt")
        .setDescription("🎯 Go hunting in the wild west wilderness")
        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1])
        .addStringOption(option => option
        .setName("mode")
        .setDescription("Modo de caça")
        .setRequired(false)
        .addChoices({ name: "Solo", value: "solo" }, { name: "Duo", value: "duo" }))
        .addUserOption(option => option
        .setName("partner")
        .setDescription("Parceiro para caçar no modo DUO")
        .setRequired(false)), "hunt"),
    cooldown: 120, // 2 minutes cooldown
    async execute(interaction) {
        await interaction.deferReply();
        const userId = interaction.user.id;
        const mode = interaction.options.getString("mode");
        const partner = interaction.options.getUser("partner");
        // Check if user has hunting rifle
        const rifleCount = (0, inventoryManager_1.getItem)(userId, "rifle_de_caca");
        if (rifleCount === 0) {
            const embed = (0, embeds_1.warningEmbed)("🚫 Rifle de Caça Necessário", "Você precisa de um **Rifle de Caça** para ir caçar!\n\n" +
                "💰 Compre um rifle na armaria por **7.500 moedas de prata**.\n" +
                "Use `/armaria` para ver os itens disponíveis.", "Equipamento necessário para caçar");
            await interaction.editReply({ embeds: [embed] });
            return;
        }
        // Import duo manager
        const { duoHuntSessionManager } = await Promise.resolve().then(() => __importStar(require("../../utils/duoHuntSessionManager")));
        // Check if user is already in a duo session
        const existingDuoSession = duoHuntSessionManager.getSessionByUser(userId);
        if (existingDuoSession) {
            const embed = (0, embeds_1.warningEmbed)("🎯 Caçada DUO em Andamento", `Você já está em uma caçada DUO!\n\n` +
                `**Parceiro:** ${existingDuoSession.player1.userId === userId ? existingDuoSession.player2.userName : existingDuoSession.player1.userName}\n` +
                `**Status:** ${existingDuoSession.status === 'WAITING' ? 'Aguardando aceite' : 'Em andamento'}`, "Termine ou cancele sua caçada DUO atual primeiro");
            await interaction.editReply({ embeds: [embed] });
            return;
        }
        // Check if user already has an active solo hunt session
        const existingSession = huntSessionManager_1.huntSessionManager.getSession(userId);
        if (existingSession) {
            const embed = (0, embeds_1.warningEmbed)("🎯 Caçada em Andamento", `Você já está caçando um **${existingSession.animalName}**!\n\n` +
                `Tentativas restantes: **${existingSession.attemptsRemaining}/${existingSession.maxAttempts}**\n` +
                `Melhor precisão: **${existingSession.bestAccuracy}%**`, "Termine sua caçada atual primeiro");
            await interaction.editReply({ embeds: [embed] });
            return;
        }
        // If no mode selected, show mode selection buttons
        if (!mode) {
            const modeEmbed = new discord_js_1.EmbedBuilder()
                .setColor("#3b82f6")
                .setTitle(`${(0, customEmojis_1.getEmoji)("dart")} Escolha o Modo de Caça`)
                .setDescription(`Escolha como você quer caçar no velho oeste:\n\n` +
                `🎯 **SOLO**\n` +
                `• Caçada individual\n` +
                `• 5 tentativas por animal\n` +
                `• Todas as recompensas para você\n\n` +
                `👥 **DUO**\n` +
                `• Caçada em dupla\n` +
                `• 10 minutos de duração\n` +
                `• Recompensas compartilhadas\n` +
                `• Ambos precisam de Rifle de Caça`)
                .setFooter({ text: "Selecione um modo abaixo" })
                .setTimestamp();
            const soloButton = new discord_js_1.ButtonBuilder()
                .setCustomId(`hunt_mode_solo_${userId}`)
                .setLabel("SOLO")
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setEmoji("🎯");
            const duoButton = new discord_js_1.ButtonBuilder()
                .setCustomId(`hunt_mode_duo_${userId}`)
                .setLabel("DUO")
                .setStyle(discord_js_1.ButtonStyle.Success)
                .setEmoji("👥");
            const row = new discord_js_1.ActionRowBuilder().addComponents(soloButton, duoButton);
            await interaction.editReply({
                embeds: [modeEmbed],
                components: [row],
            });
            return;
        }
        // Handle DUO mode
        if (mode === "duo") {
            if (!partner) {
                const embed = (0, embeds_1.warningEmbed)("❌ Parceiro Necessário", "Para caçar em modo DUO, você precisa selecionar um parceiro!\n\n" +
                    "Use: `/hunt mode:duo partner:@usuario`", "Selecione um parceiro para caçar");
                await interaction.editReply({ embeds: [embed] });
                return;
            }
            if (partner.id === userId) {
                const embed = (0, embeds_1.warningEmbed)("❌ Parceiro Inválido", "Você não pode caçar consigo mesmo, parceiro!", "Selecione outro usuário");
                await interaction.editReply({ embeds: [embed] });
                return;
            }
            if (partner.bot) {
                const embed = (0, embeds_1.warningEmbed)("❌ Parceiro Inválido", "Bots não podem caçar, parceiro!", "Selecione um usuário real");
                await interaction.editReply({ embeds: [embed] });
                return;
            }
            // Check if partner has a rifle
            const partnerRifleCount = (0, inventoryManager_1.getItem)(partner.id, "rifle_de_caca");
            if (partnerRifleCount === 0) {
                const embed = (0, embeds_1.warningEmbed)("🚫 Parceiro sem Rifle", `**${partner.username}** não possui um Rifle de Caça!\n\n` +
                    "Ambos os caçadores precisam de rifles para caçar em DUO.", "Parceiro precisa comprar um rifle");
                await interaction.editReply({ embeds: [embed] });
                return;
            }
            // Check if partner is already in a session
            if (duoHuntSessionManager.getSessionByUser(partner.id)) {
                const embed = (0, embeds_1.warningEmbed)("❌ Parceiro Ocupado", `**${partner.username}** já está em uma caçada DUO!`, "Escolha outro parceiro");
                await interaction.editReply({ embeds: [embed] });
                return;
            }
            // Create duo invite
            const duoSession = duoHuntSessionManager.createInvite(userId, interaction.user.username, partner.id, partner.username);
            const inviteEmbed = new discord_js_1.EmbedBuilder()
                .setColor("#3b82f6")
                .setTitle(`${(0, customEmojis_1.getEmoji)("cowboy")} Convite de Caçada DUO`)
                .setDescription(`**${interaction.user.username}** convidou **${partner.username}** para uma caçada DUO!\n\n` +
                `${(0, customEmojis_1.getEmoji)("timer")} **Duração:** 10 minutos\n` +
                `${(0, customEmojis_1.getEmoji)("rifle_de_caca")} **Requisito:** Ambos precisam de Rifle de Caça\n` +
                `${(0, customEmojis_1.getEmoji)("gift")} **Recompensas:** Compartilhadas entre os caçadores\n\n` +
                `**${partner.username}**, clique no botão abaixo para aceitar!`)
                .setFooter({ text: "Convite expira em 2 minutos" })
                .setTimestamp();
            const acceptButton = new discord_js_1.ButtonBuilder()
                .setCustomId(`duo_hunt_accept_${duoSession.sessionId}`)
                .setLabel("Aceitar Convite")
                .setStyle(discord_js_1.ButtonStyle.Success)
                .setEmoji("✅");
            const cancelButton = new discord_js_1.ButtonBuilder()
                .setCustomId(`duo_hunt_cancel_${duoSession.sessionId}`)
                .setLabel("Recusar")
                .setStyle(discord_js_1.ButtonStyle.Danger)
                .setEmoji("❌");
            const row = new discord_js_1.ActionRowBuilder().addComponents(acceptButton, cancelButton);
            await interaction.editReply({
                content: `<@${partner.id}>`,
                embeds: [inviteEmbed],
                components: [row],
            });
            return;
        }
        // SOLO mode (original behavior)
        const animal = selectAnimal();
        if (!animal) {
            const embed = (0, embeds_1.errorEmbed)("❌ Erro na Caçada", "Ocorreu um erro ao procurar animais. Tente novamente!");
            await interaction.editReply({ embeds: [embed] });
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
    },
};
//# sourceMappingURL=hunt.js.map