"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPLY_ITEMS = exports.SPECIAL_ITEMS = exports.FISH_ITEMS = exports.PELT_ITEMS = exports.MEAT_ITEMS = void 0;
const discord_js_1 = require("discord.js");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
const customEmojis_1 = require("../../utils/customEmojis");
const MEAT_ITEMS = [
    {
        id: "rabbit_meat",
        name: "Carne de Coelho",
        emoji: "🍖",
        price: 50,
        rarity: "COMUM",
        rarityColor: "#808080",
    },
    {
        id: "deer_meat",
        name: "Carne de Cervo",
        emoji: "🥩",
        price: 150,
        rarity: "INCOMUM",
        rarityColor: "#4ade80",
    },
    {
        id: "wolf_meat",
        name: "Carne de Lobo",
        emoji: "🥩",
        price: 300,
        rarity: "RARO",
        rarityColor: "#3b82f6",
    },
    {
        id: "bison_meat",
        name: "Carne de Bisão",
        emoji: "🥩",
        price: 500,
        rarity: "ÉPICO",
        rarityColor: "#a855f7",
    },
    {
        id: "bear_meat",
        name: "Carne de Urso",
        emoji: "🥩",
        price: 800,
        rarity: "LENDÁRIO",
        rarityColor: "#f59e0b",
    },
];
exports.MEAT_ITEMS = MEAT_ITEMS;
const PELT_ITEMS = [
    {
        id: "rabbit_pelt",
        name: "Pele de Coelho",
        emoji: (0, customEmojis_1.getEmoji)("rabbit_pelt"),
        price: 100,
        rarity: "COMUM",
        rarityColor: "#808080",
    },
    {
        id: "deer_pelt",
        name: "Pele de Cervo",
        emoji: (0, customEmojis_1.getEmoji)("deer_pelt"),
        price: 300,
        rarity: "INCOMUM",
        rarityColor: "#4ade80",
    },
    {
        id: "wolf_pelt",
        name: "Pele de Lobo",
        emoji: (0, customEmojis_1.getEmoji)("wolf_pelt"),
        price: 600,
        rarity: "RARO",
        rarityColor: "#3b82f6",
    },
    {
        id: "bison_pelt",
        name: "Pele de Bisão",
        emoji: (0, customEmojis_1.getEmoji)("bison_pelt"),
        price: 1000,
        rarity: "ÉPICO",
        rarityColor: "#a855f7",
    },
    {
        id: "bear_pelt",
        name: "Pele de Urso",
        emoji: (0, customEmojis_1.getEmoji)("bear_pelt"),
        price: 1500,
        rarity: "LENDÁRIO",
        rarityColor: "#f59e0b",
    },
];
exports.PELT_ITEMS = PELT_ITEMS;
const SPECIAL_ITEMS = [
    {
        id: "eagle_feather",
        name: "Pena de Águia",
        emoji: (0, customEmojis_1.getEmoji)("eagle_feather"),
        price: 2000,
        rarity: "MÍTICO",
        rarityColor: "#d4af37",
    },
];
exports.SPECIAL_ITEMS = SPECIAL_ITEMS;
const FISH_ITEMS = [
    {
        id: "catfish",
        name: "Bagre do Rio",
        emoji: (0, customEmojis_1.getEmoji)("catfish"),
        price: 80,
        rarity: "COMUM",
        rarityColor: "#808080",
    },
    {
        id: "silver_trout",
        name: "Truta Prateada",
        emoji: (0, customEmojis_1.getEmoji)("silver_trout"),
        price: 180,
        rarity: "INCOMUM",
        rarityColor: "#4ade80",
    },
    {
        id: "wild_salmon",
        name: "Salmão Selvagem",
        emoji: (0, customEmojis_1.getEmoji)("wild_salmon"),
        price: 350,
        rarity: "RARO",
        rarityColor: "#3b82f6",
    },
    {
        id: "giant_pike",
        name: "Lúcio Gigante",
        emoji: (0, customEmojis_1.getEmoji)("giant_pike"),
        price: 700,
        rarity: "ÉPICO",
        rarityColor: "#a855f7",
    },
    {
        id: "golden_sturgeon",
        name: "Esturjão Dourado",
        emoji: (0, customEmojis_1.getEmoji)("golden_sturgeon"),
        price: 1200,
        rarity: "LENDÁRIO",
        rarityColor: "#f59e0b",
    },
    {
        id: "mythic_western_fish",
        name: "Peixe Mítico do Oeste",
        emoji: (0, customEmojis_1.getEmoji)("mythic_western_fish"),
        price: 2500,
        rarity: "MÍTICO",
        rarityColor: "#d4af37",
    },
];
exports.FISH_ITEMS = FISH_ITEMS;
const SUPPLY_ITEMS = [
    {
        id: "basic_bait",
        name: "Isca Básica",
        emoji: (0, customEmojis_1.getEmoji)("basic_bait"),
        price: 5,
        rarity: "COMUM",
        rarityColor: "#808080",
    },
    {
        id: "premium_bait",
        name: "Isca Premium",
        emoji: (0, customEmojis_1.getEmoji)("premium_bait"),
        price: 12,
        rarity: "INCOMUM",
        rarityColor: "#4ade80",
    },
];
exports.SUPPLY_ITEMS = SUPPLY_ITEMS;
exports.default = {
    data: (0, commandLocalizations_1.applyLocalizations)(new discord_js_1.SlashCommandBuilder()
        .setName("hunterstore")
        .setDescription("🏪 Venda suas carnes e peles de caça por moedas de prata")
        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1]), "hunterstore"),
    cooldown: 3,
    async execute(interaction) {
        await interaction.deferReply();
        const userId = interaction.user.id;
        const mainEmbed = new discord_js_1.EmbedBuilder()
            .setColor("#d4af37")
            .setTitle(`${(0, customEmojis_1.getEmoji)("shop")} Hunter's Store - Loja do Caçador`)
            .setDescription(`Bem-vindo à **Hunter's Store**, ${interaction.user.username}!\n\n` +
            `Compramos suas carnes, peles e peixes pelos melhores preços do velho oeste!\n` +
            `Também vendemos suprimentos essenciais para caça e pesca!\n\n` +
            `${(0, customEmojis_1.getEmoji)("gift")} **Vendemos (você vende para nós):**\n` +
            `🍖 **Carnes** - De coelho a urso\n` +
            `${(0, customEmojis_1.getEmoji)("rabbit_pelt")} **Peles** - Valiosas peles de animais\n` +
            `🐟 **Peixes** - Do bagre ao peixe mítico\n` +
            `🪶 **Penas Raras** - Penas de águia dourada\n\n` +
            `${(0, customEmojis_1.getEmoji)("shop")} **Compramos (você compra de nós):**\n` +
            `🪱 **Suprimentos** - Iscas para pesca\n\n` +
            `${(0, customEmojis_1.getEmoji)("coin")} Todos os pagamentos são feitos em **moedas de prata**!\n\n` +
            `Selecione uma categoria abaixo:`)
            .setImage("https://i.postimg.cc/BQ11FPd3/IMG-3478.png")
            .setFooter({ text: "Escolha uma categoria" })
            .setTimestamp();
        const meatButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`hunterstore_meat_${userId}`)
            .setLabel("Vender Carnes")
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setEmoji("🥩");
        const peltButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`hunterstore_pelt_${userId}`)
            .setLabel("Vender Peles")
            .setStyle(discord_js_1.ButtonStyle.Success)
            .setEmoji((0, customEmojis_1.getEmoji)("deer_pelt"));
        const fishButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`hunterstore_fish_${userId}`)
            .setLabel("Vender Peixes")
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setEmoji("🐟");
        const specialButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`hunterstore_special_${userId}`)
            .setLabel("Vender Penas")
            .setStyle(discord_js_1.ButtonStyle.Secondary)
            .setEmoji("🪶");
        const supplyButton = new discord_js_1.ButtonBuilder()
            .setCustomId(`hunterstore_supply_${userId}`)
            .setLabel("Comprar Suprimentos")
            .setStyle(discord_js_1.ButtonStyle.Danger)
            .setEmoji("🪱");
        const row1 = new discord_js_1.ActionRowBuilder().addComponents(meatButton, peltButton, fishButton, specialButton);
        const row2 = new discord_js_1.ActionRowBuilder().addComponents(supplyButton);
        await interaction.editReply({
            embeds: [mainEmbed],
            components: [row1, row2],
        });
    },
};
//# sourceMappingURL=hunterstore.js.map