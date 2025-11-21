import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { applyLocalizations } from "../../utils/commandLocalizations";
import { getItem, removeItem } from "../../utils/inventoryManager";
import { depositSilver } from "../../utils/bankManager";
import { getEmoji } from "../../utils/customEmojis";
import { errorEmbed, warningEmbed } from "../../utils/embeds";

interface HuntItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  rarity: string;
  rarityColor: string;
}

const MEAT_ITEMS: HuntItem[] = [
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

const PELT_ITEMS: HuntItem[] = [
  {
    id: "rabbit_pelt",
    name: "Pele de Coelho",
    emoji: getEmoji("rabbit_pelt"),
    price: 100,
    rarity: "COMUM",
    rarityColor: "#808080",
  },
  {
    id: "deer_pelt",
    name: "Pele de Cervo",
    emoji: getEmoji("deer_pelt"),
    price: 300,
    rarity: "INCOMUM",
    rarityColor: "#4ade80",
  },
  {
    id: "wolf_pelt",
    name: "Pele de Lobo",
    emoji: getEmoji("wolf_pelt"),
    price: 600,
    rarity: "RARO",
    rarityColor: "#3b82f6",
  },
  {
    id: "bison_pelt",
    name: "Pele de Bisão",
    emoji: getEmoji("bison_pelt"),
    price: 1000,
    rarity: "ÉPICO",
    rarityColor: "#a855f7",
  },
  {
    id: "bear_pelt",
    name: "Pele de Urso",
    emoji: getEmoji("bear_pelt"),
    price: 1500,
    rarity: "LENDÁRIO",
    rarityColor: "#f59e0b",
  },
];

const SPECIAL_ITEMS: HuntItem[] = [
  {
    id: "eagle_feather",
    name: "Pena de Águia",
    emoji: getEmoji("eagle_feather"),
    price: 2000,
    rarity: "MÍTICO",
    rarityColor: "#d4af37",
  },
];

const FISH_ITEMS: HuntItem[] = [
  {
    id: "catfish",
    name: "Bagre do Rio",
    emoji: getEmoji("catfish"),
    price: 80,
    rarity: "COMUM",
    rarityColor: "#808080",
  },
  {
    id: "silver_trout",
    name: "Truta Prateada",
    emoji: getEmoji("silver_trout"),
    price: 180,
    rarity: "INCOMUM",
    rarityColor: "#4ade80",
  },
  {
    id: "wild_salmon",
    name: "Salmão Selvagem",
    emoji: getEmoji("wild_salmon"),
    price: 350,
    rarity: "RARO",
    rarityColor: "#3b82f6",
  },
  {
    id: "giant_pike",
    name: "Lúcio Gigante",
    emoji: getEmoji("giant_pike"),
    price: 700,
    rarity: "ÉPICO",
    rarityColor: "#a855f7",
  },
  {
    id: "golden_sturgeon",
    name: "Esturjão Dourado",
    emoji: getEmoji("golden_sturgeon"),
    price: 1200,
    rarity: "LENDÁRIO",
    rarityColor: "#f59e0b",
  },
  {
    id: "mythic_western_fish",
    name: "Peixe Mítico do Oeste",
    emoji: getEmoji("mythic_western_fish"),
    price: 2500,
    rarity: "MÍTICO",
    rarityColor: "#d4af37",
  },
];

const SUPPLY_ITEMS: HuntItem[] = [
  {
    id: "basic_bait",
    name: "Isca Básica",
    emoji: getEmoji("basic_bait"),
    price: 5,
    rarity: "COMUM",
    rarityColor: "#808080",
  },
  {
    id: "premium_bait",
    name: "Isca Premium",
    emoji: getEmoji("premium_bait"),
    price: 12,
    rarity: "INCOMUM",
    rarityColor: "#4ade80",
  },
];

export default {
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName("hunterstore")
      .setDescription("🏪 Venda suas carnes e peles de caça por moedas de prata")
      .setContexts([0, 1, 2])
      .setIntegrationTypes([0, 1]),
    "hunterstore",
  ),
  cooldown: 3,
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const userId = interaction.user.id;

    const mainEmbed = new EmbedBuilder()
      .setColor("#d4af37")
      .setTitle(`${getEmoji("shop")} Hunter's Store - Loja do Caçador`)
      .setDescription(
        `Bem-vindo à **Hunter's Store**, ${interaction.user.username}!\n\n` +
        `Compramos suas carnes, peles e peixes pelos melhores preços do velho oeste!\n` +
        `Também vendemos suprimentos essenciais para caça e pesca!\n\n` +
        `${getEmoji("gift")} **Vendemos (você vende para nós):**\n` +
        `🍖 **Carnes** - De coelho a urso\n` +
        `${getEmoji("rabbit_pelt")} **Peles** - Valiosas peles de animais\n` +
        `${getEmoji("catfish")} **Peixes** - Do bagre ao peixe mítico\n` +
        `${getEmoji("eagle_feather")} **Penas Raras** - Penas de águia dourada\n\n` +
        `${getEmoji("shop")} **Compramos (você compra de nós):**\n` +
        `${getEmoji("basic_bait")} **Suprimentos** - Iscas para pesca\n\n` +
        `${getEmoji("coin")} Todos os pagamentos são feitos em **moedas de prata**!\n\n` +
        `Selecione uma categoria abaixo:`
      )
      .setImage("https://i.postimg.cc/BQ11FPd3/IMG-3478.png")
      .setFooter({ text: "Escolha uma categoria" })
      .setTimestamp();

    const meatButton = new ButtonBuilder()
      .setCustomId(`hunterstore_meat_${userId}`)
      .setLabel("Vender Carnes")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🥩");

    const peltButton = new ButtonBuilder()
      .setCustomId(`hunterstore_pelt_${userId}`)
      .setLabel("Vender Peles")
      .setStyle(ButtonStyle.Success)
      .setEmoji(getEmoji("deer_pelt"));

    const fishButton = new ButtonBuilder()
      .setCustomId(`hunterstore_fish_${userId}`)
      .setLabel("Vender Peixes")
      .setStyle(ButtonStyle.Primary)
      .setEmoji(getEmoji("catfish"));

    const specialButton = new ButtonBuilder()
      .setCustomId(`hunterstore_special_${userId}`)
      .setLabel("Vender Penas")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(getEmoji("eagle_feather"));

    const supplyButton = new ButtonBuilder()
      .setCustomId(`hunterstore_supply_${userId}`)
      .setLabel("Comprar Suprimentos")
      .setStyle(ButtonStyle.Danger)
      .setEmoji(getEmoji("basic_bait"));

    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      meatButton,
      peltButton,
      fishButton,
      specialButton,
    );

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      supplyButton,
    );

    await interaction.editReply({
      embeds: [mainEmbed],
      components: [row1, row2],
    });
  },
};

export { MEAT_ITEMS, PELT_ITEMS, FISH_ITEMS, SPECIAL_ITEMS, SUPPLY_ITEMS };
