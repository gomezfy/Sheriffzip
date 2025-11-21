import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { applyLocalizations } from "../../utils/commandLocalizations";
import { errorEmbed, warningEmbed } from "../../utils/embeds";
import { getItem, removeItem } from "../../utils/inventoryManager";
import { fishingSessionManager } from "../../utils/fishingSessionManager";
import { getEmoji } from "../../utils/customEmojis";

interface Fish {
  name: string;
  emoji: string;
  rarity: string;
  rarityColor: string;
  chance: number;
  rewards: {
    fish: { id: string; amount: number };
  };
  experience: number;
  difficulty: number; // 1-5 (1 = fácil, 5 = muito difícil)
  requiredCatches: number; // Quantas vezes precisa acertar a zona
  imageUrl: string;
}

const FISHES: Fish[] = [
  {
    name: "Bagre do Rio",
    emoji: getEmoji("catfish"),
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
    emoji: getEmoji("silver_trout"),
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
    emoji: getEmoji("wild_salmon"),
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
    emoji: getEmoji("giant_pike"),
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
    emoji: getEmoji("golden_sturgeon"),
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
    emoji: getEmoji("mythic_western_fish"),
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

function selectFish(usePremiumBait: boolean = false): Fish | null {
  let fishes = [...FISHES];
  
  // Premium bait increases chances of rare fish
  if (usePremiumBait) {
    // Reduce common fish chances and increase rare fish chances
    fishes = fishes.map(fish => {
      if (fish.rarity === "COMUM") {
        return { ...fish, chance: fish.chance * 0.5 }; // Reduce common by 50%
      } else if (fish.rarity === "INCOMUM") {
        return { ...fish, chance: fish.chance * 0.8 }; // Reduce uncommon by 20%
      } else if (fish.rarity === "RARO" || fish.rarity === "ÉPICO") {
        return { ...fish, chance: fish.chance * 1.8 }; // Increase rare/epic by 80%
      } else if (fish.rarity === "LENDÁRIO" || fish.rarity === "MÍTICO") {
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

export default {
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName("fish")
      .setDescription("Pescar nos rios e lagos do Velho Oeste")
      .setContexts([0, 1, 2])
      .setIntegrationTypes([0, 1]),
    "fish",
  ),
  cooldown: 10, // 10 seconds cooldown
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const userId = interaction.user.id;

    // Check if user has fishing rod
    const rodCount = getItem(userId, "fishing_rod");
    if (rodCount === 0) {
      const embed = warningEmbed(
        "🚫 Vara de Pesca Necessária",
        "Você precisa de uma **Vara de Pesca** para ir pescar!\n\n" +
          "💰 Compre uma vara na armaria por **5.000 moedas de prata**.\n" +
          "Use `/armaria` para ver os itens disponíveis.",
        "Equipamento necessário para pescar",
      );

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // Check if user has bait (basic or premium)
    const basicBaitCount = getItem(userId, "basic_bait");
    const premiumBaitCount = getItem(userId, "premium_bait");
    const hasBait = basicBaitCount > 0 || premiumBaitCount > 0;
    
    if (!hasBait) {
      const embed = warningEmbed(
        `${getEmoji("basic_bait")} Isca Necessária`,
        "Você precisa de **Isca** para pescar!\n\n" +
          "💰 Compre iscas no **Hunter's Store** (`/hunterstore`).\n" +
          "🎣 Cada pesca consome 1 isca.\n\n" +
          "**Tipos de isca:**\n" +
          `${getEmoji("basic_bait")} **Isca Básica** - Peixes comuns e incomuns\n` +
          `${getEmoji("premium_bait")} **Isca Premium** - Aumenta chance de peixes raros!`,
        "Isca necessária para pescar",
      );

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // Check if user already has an active fishing session
    const existingSession = fishingSessionManager.getSession(userId);
    if (existingSession) {
      const embed = warningEmbed(
        "🎣 Pesca em Andamento",
        `Você já está pescando um **${existingSession.fishName}**!\n\n` +
          `Tentativas restantes: **${existingSession.attemptsRemaining}/${existingSession.maxAttempts}**\n` +
          `Acertos: **${existingSession.successfulCatches}/${existingSession.requiredCatches}**`,
        "Termine sua pesca atual primeiro",
      );
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // Select a random fish (premium bait increases chances of rare fish)
    const usePremiumBait = premiumBaitCount > 0;
    const fish = selectFish(usePremiumBait);
    if (!fish) {
      const embed = errorEmbed(
        "❌ Erro na Pesca",
        "Ocorreu um erro ao procurar peixes. Tente novamente!",
      );
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // Consume 1 bait (premium first if available)
    if (usePremiumBait) {
      await removeItem(userId, "premium_bait", 1);
    } else {
      await removeItem(userId, "basic_bait", 1);
    }

    // Create fishing session
    const session = fishingSessionManager.createSession(
      userId,
      interaction.user.username,
      fish,
    );

    // Generate initial bar
    const bar = fishingSessionManager.generateBar(userId);

    const baitUsed = usePremiumBait ? `${getEmoji("premium_bait")} Isca Premium` : `${getEmoji("basic_bait")} Isca Básica`;
    const baitBonus = usePremiumBait ? `\n${getEmoji("sparkles")} **Bônus de Isca Premium ativo!** Mais chances de peixes raros!` : "";
    
    const fishEmbed = new EmbedBuilder()
      .setColor(fish.rarityColor as `#${string}`)
      .setTitle(`${getEmoji("dart")} Pesca Iniciada!`)
      .setDescription(
        `Você lançou sua linha com ${baitUsed} e fisgou algo!${baitBonus}\n\n` +
        `**Peixe Fisgado**\n` +
        `${fish.emoji} **${fish.name}**\n\n` +
        `${getEmoji("star")} **Raridade:** ${fish.rarity}\n` +
        `${getEmoji("lightning")} **Dificuldade:** ${"🔥".repeat(fish.difficulty)}\n` +
        `${getEmoji("dart")} **Acertos Necessários:** ${fish.requiredCatches}\n\n` +
        `**${getEmoji("info")} COMO JOGAR:**\n` +
        `Use os botões < e > para manter o 🎣 na zona verde 🟢!\n` +
        `Acerte a zona ${fish.requiredCatches} vezes para pegar o peixe!\n\n` +
        `**Barra de Posição:**\n\`\`\`${bar}\`\`\``,
      )
      .addFields(
        {
          name: `${getEmoji("timer")} Status`,
          value: `⏱️ Tentativas: ${session.attemptsRemaining}/${session.maxAttempts}\n✅ Acertos: ${session.successfulCatches}/${session.requiredCatches}`,
          inline: true
        },
        {
          name: `${getEmoji("gift")} Recompensas`,
          value: `${fish.emoji} ${fish.name}\n${getEmoji("star")} +${fish.experience} XP`,
          inline: true
        }
      )
      .setFooter({ 
        text: `🎣 Mantenha o 🎣 na zona verde 🟢 e pressione os botões no momento certo!` 
      })
      .setTimestamp();

    const leftButton = new ButtonBuilder()
      .setCustomId(`fish_left_${userId}`)
      .setLabel("<")
      .setStyle(ButtonStyle.Secondary);

    const rightButton = new ButtonBuilder()
      .setCustomId(`fish_right_${userId}`)
      .setLabel(">")
      .setStyle(ButtonStyle.Secondary);

    const catchButton = new ButtonBuilder()
      .setCustomId(`fish_catch_${userId}`)
      .setLabel("Fisgar")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      leftButton,
      catchButton,
      rightButton,
    );

    await interaction.editReply({
      embeds: [fishEmbed],
      components: [row],
    });
  },
};

// Export functions and data for button handler
export { FISHES, selectFish };
