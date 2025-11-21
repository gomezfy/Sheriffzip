"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FISHES = void 0;
exports.selectFish = selectFish;
const discord_js_1 = require("discord.js");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
const embeds_1 = require("../../utils/embeds");
const inventoryManager_1 = require("../../utils/inventoryManager");
const fishingSessionManager_1 = require("../../utils/fishingSessionManager");
const customEmojis_1 = require("../../utils/customEmojis");
const FISHES = [
    {
        name: "Bagre do Rio",
        emoji: (0, customEmojis_1.getEmoji)("catfish"),
        rarity: "COMUM",
        rarityColor: "#808080",
        chance: 35,
        rewards: {
            fish: { id: "catfish", amount: 1 },
        },
        experience: 20,
        difficulty: 1,
        requiredCatches: 3,
        imageUrl: "https://i.postimg.cc/FzQKJ8yN/catfish.png",
    },
    {
        name: "Truta Prateada",
        emoji: (0, customEmojis_1.getEmoji)("silver_trout"),
        rarity: "INCOMUM",
        rarityColor: "#4ade80",
        chance: 25,
        rewards: {
            fish: { id: "silver_trout", amount: 1 },
        },
        experience: 40,
        difficulty: 2,
        requiredCatches: 4,
        imageUrl: "https://i.postimg.cc/mkhQ3QNM/trout.png",
    },
    {
        name: "Salmão Selvagem",
        emoji: (0, customEmojis_1.getEmoji)("wild_salmon"),
        rarity: "RARO",
        rarityColor: "#3b82f6",
        chance: 18,
        rewards: {
            fish: { id: "wild_salmon", amount: 1 },
        },
        experience: 60,
        difficulty: 3,
        requiredCatches: 4,
        imageUrl: "https://i.postimg.cc/MKj6pYSW/salmon.png",
    },
    {
        name: "Lúcio Gigante",
        emoji: (0, customEmojis_1.getEmoji)("giant_pike"),
        rarity: "ÉPICO",
        rarityColor: "#a855f7",
        chance: 12,
        rewards: {
            fish: { id: "giant_pike", amount: 1 },
        },
        experience: 100,
        difficulty: 4,
        requiredCatches: 5,
        imageUrl: "https://i.postimg.cc/QxkMWLDB/pike.png",
    },
    {
        name: "Esturjão Dourado",
        emoji: (0, customEmojis_1.getEmoji)("golden_sturgeon"),
        rarity: "LENDÁRIO",
        rarityColor: "#f59e0b",
        chance: 7,
        rewards: {
            fish: { id: "golden_sturgeon", amount: 1 },
        },
        experience: 150,
        difficulty: 5,
        requiredCatches: 6,
        imageUrl: "https://i.postimg.cc/15LRzNHm/sturgeon.png",
    },
    {
        name: "Peixe Mítico do Oeste",
        emoji: (0, customEmojis_1.getEmoji)("mythic_western_fish"),
        rarity: "MÍTICO",
        rarityColor: "#d4af37",
        chance: 3,
        rewards: {
            fish: { id: "mythic_western_fish", amount: 1 },
        },
        experience: 250,
        difficulty: 5,
        requiredCatches: 7,
        imageUrl: "https://i.postimg.cc/hGqYb9cL/mythic-fish.png",
    },
];
exports.FISHES = FISHES;
function selectFish(usePremiumBait = false) {
    let fishes = [...FISHES];
    // Premium bait increases chances of rare fish
    if (usePremiumBait) {
        // Reduce common fish chances and increase rare fish chances
        fishes = fishes.map(fish => {
            if (fish.rarity === "COMUM") {
                return { ...fish, chance: fish.chance * 0.5 }; // Reduce common by 50%
            }
            else if (fish.rarity === "INCOMUM") {
                return { ...fish, chance: fish.chance * 0.8 }; // Reduce uncommon by 20%
            }
            else if (fish.rarity === "RARO" || fish.rarity === "ÉPICO") {
                return { ...fish, chance: fish.chance * 1.8 }; // Increase rare/epic by 80%
            }
            else if (fish.rarity === "LENDÁRIO" || fish.rarity === "MÍTICO") {
                return { ...fish, chance: fish.chance * 2.5 }; // Increase legendary/mythic by 150%
            }
            return fish;
        });
    }
    // Normalize chances to add up to 100
    const totalChance = fishes.reduce((sum, fish) => sum + fish.chance, 0);
    fishes = fishes.map(fish => ({ ...fish, chance: (fish.chance / totalChance) * 100 }));
    const roll = Math.random() * 100;
    let cumulative = 0;
    for (const fish of fishes) {
        cumulative += fish.chance;
        if (roll <= cumulative) {
            return fish;
        }
    }
    return null;
}
exports.default = {
    data: (0, commandLocalizations_1.applyLocalizations)(new discord_js_1.SlashCommandBuilder()
        .setName("fish")
        .setDescription("Pescar nos rios e lagos do Velho Oeste")
        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1]), "fish"),
    cooldown: 10, // 10 seconds cooldown
    async execute(interaction) {
        await interaction.deferReply();
        const userId = interaction.user.id;
        // Check if user has fishing rod
        const rodCount = (0, inventoryManager_1.getItem)(userId, "fishing_rod");
        if (rodCount === 0) {
            const embed = (0, embeds_1.warningEmbed)(`${(0, customEmojis_1.getEmoji)("cancel")} Vara de Pesca Necessária`, `Você precisa de uma **Vara de Pesca** ${(0, customEmojis_1.getEmoji)("fishing_rod")} para ir pescar!\n\n` +
                `${(0, customEmojis_1.getEmoji)("gold_bar")} Compre uma vara na armaria por **5.000 moedas de prata**.\n` +
                `${(0, customEmojis_1.getEmoji)("info")} Use \`/armaria\` para ver os itens disponíveis.`, "Equipamento necessário para pescar");
            await interaction.editReply({ embeds: [embed] });
            return;
        }
        // Check if user has bait (basic or premium)
        const basicBaitCount = (0, inventoryManager_1.getItem)(userId, "basic_bait");
        const premiumBaitCount = (0, inventoryManager_1.getItem)(userId, "premium_bait");
        const hasBait = basicBaitCount > 0 || premiumBaitCount > 0;
        if (!hasBait) {
            const embed = (0, embeds_1.warningEmbed)(`${(0, customEmojis_1.getEmoji)("basic_bait")} Isca Necessária`, `Você precisa de **Isca** para pescar!\n\n` +
                `${(0, customEmojis_1.getEmoji)("moneybag")} Compre iscas no **Hunter's Store** (\`/hunterstore\`).\n` +
                `${(0, customEmojis_1.getEmoji)("gift")} Cada pesca consome 1 isca.\n\n` +
                `**Tipos de isca:**\n` +
                `${(0, customEmojis_1.getEmoji)("basic_bait")} **Isca Básica** - Peixes comuns e incomuns\n` +
                `${(0, customEmojis_1.getEmoji)("premium_bait")} **Isca Premium** ${(0, customEmojis_1.getEmoji)("sparkles")} - Aumenta chance de peixes raros!`, "Isca necessária para pescar");
            await interaction.editReply({ embeds: [embed] });
            return;
        }
        // Check if user already has an active fishing session
        const existingSession = fishingSessionManager_1.fishingSessionManager.getSession(userId);
        if (existingSession) {
            const embed = (0, embeds_1.warningEmbed)(`${(0, customEmojis_1.getEmoji)("fishing_rod")} Pesca em Andamento`, `Você já está pescando um **${existingSession.fishName}**!\n\n` +
                `${(0, customEmojis_1.getEmoji)("timer")} Tentativas restantes: **${existingSession.attemptsRemaining}/${existingSession.maxAttempts}**\n` +
                `${(0, customEmojis_1.getEmoji)("check")} Acertos: **${existingSession.successfulCatches}/${existingSession.requiredCatches}**`, "Termine sua pesca atual primeiro");
            await interaction.editReply({ embeds: [embed] });
            return;
        }
        // Show bait selection if user has both types of bait
        let usePremiumBait;
        if (basicBaitCount > 0 && premiumBaitCount > 0) {
            // User has both bait types - show selection menu
            const selectEmbed = new discord_js_1.EmbedBuilder()
                .setColor("#DAA520")
                .setTitle(`${(0, customEmojis_1.getEmoji)("basic_bait")} Equipar Isca para Pesca`)
                .setDescription(`Escolha qual isca deseja equipar:\n\n` +
                `${(0, customEmojis_1.getEmoji)("basic_bait")} **Isca Básica** - Peixes comuns e incomuns (x${basicBaitCount})\n` +
                `${(0, customEmojis_1.getEmoji)("premium_bait")} **Isca Premium** ${(0, customEmojis_1.getEmoji)("sparkles")} - Aumenta chance de peixes raros! (x${premiumBaitCount})`)
                .setFooter({ text: "Selecione a isca abaixo" })
                .setTimestamp();
            const selectMenu = new discord_js_1.StringSelectMenuBuilder()
                .setCustomId(`fish_select_bait_${userId}`)
                .setPlaceholder(`${(0, customEmojis_1.getEmoji)("basic_bait")} Selecione uma isca...`)
                .addOptions(new discord_js_1.StringSelectMenuOptionBuilder()
                .setLabel("Isca Básica")
                .setDescription(`Peixes comuns e incomuns - Disponível: ${basicBaitCount}`)
                .setValue("basic")
                .setEmoji((0, customEmojis_1.getEmoji)("basic_bait")), new discord_js_1.StringSelectMenuOptionBuilder()
                .setLabel("Isca Premium")
                .setDescription(`Aumenta chance de peixes raros! - Disponível: ${premiumBaitCount}`)
                .setValue("premium")
                .setEmoji((0, customEmojis_1.getEmoji)("premium_bait"))
                .setDefault(premiumBaitCount > 0));
            const row = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
            await interaction.editReply({
                embeds: [selectEmbed],
                components: [row],
            });
            return;
        }
        // User has only one type of bait - auto-select
        usePremiumBait = premiumBaitCount > 0;
        const fish = selectFish(usePremiumBait);
        if (!fish) {
            const embed = (0, embeds_1.errorEmbed)("❌ Erro na Pesca", "Ocorreu um erro ao procurar peixes. Tente novamente!");
            await interaction.editReply({ embeds: [embed] });
            return;
        }
        // Consume 1 bait (premium first if available)
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
            components: [row],
        });
    },
};
//# sourceMappingURL=fish.js.map