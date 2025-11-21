import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { applyLocalizations } from "../../utils/commandLocalizations";
import { getItem } from "../../utils/inventoryManager";
import { getEmoji } from "../../utils/customEmojis";
import { errorEmbed } from "../../utils/embeds";
import { getDataPath } from "../../utils/database";
import fs from "fs";
import path from "path";

const dataDir = getDataPath("data");
const equippedBaitFile = path.join(dataDir, "equipped_bait.json");

interface EquippedBaitData {
  [userId: string]: string; // "basic" or "premium"
}

export function getEquippedBait(userId: string): string | null {
  try {
    if (!fs.existsSync(equippedBaitFile)) {
      return null;
    }
    const data: EquippedBaitData = JSON.parse(fs.readFileSync(equippedBaitFile, "utf-8"));
    return data[userId] || null;
  } catch {
    return null;
  }
}

export function setEquippedBait(userId: string, baitType: string): void {
  try {
    let data: EquippedBaitData = {};
    if (fs.existsSync(equippedBaitFile)) {
      data = JSON.parse(fs.readFileSync(equippedBaitFile, "utf-8"));
    }
    data[userId] = baitType;
    fs.writeFileSync(equippedBaitFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Erro ao salvar isca equipada:", error);
  }
}

export default {
  data: applyLocalizations(
    new SlashCommandBuilder()
      .setName("iscar")
      .setDescription("Equipar qual isca usar para pescar")
      .setContexts([0, 1, 2])
      .setIntegrationTypes([0, 1]),
    "iscar",
  ),
  cooldown: 5,
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const userId = interaction.user.id;
    const basicBaitCount = getItem(userId, "basic_bait");
    const premiumBaitCount = getItem(userId, "premium_bait");
    const equippedBait = getEquippedBait(userId);

    if (basicBaitCount === 0 && premiumBaitCount === 0) {
      const embed = errorEmbed(
        `${getEmoji("cancel")} Nenhuma Isca Disponível`,
        `${getEmoji("moneybag")} Compre iscas no **Hunter's Store** (\`/hunterstore\`)!`
      );
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const selectEmbed = new EmbedBuilder()
      .setColor("#DAA520")
      .setTitle(`${getEmoji("basic_bait")} Selecionar Isca`)
      .setDescription(`Escolha qual isca deseja equipar para pescar:\n`)
      .setFooter({ text: "Clique no menu para selecionar" })
      .setTimestamp();

    const options: StringSelectMenuOptionBuilder[] = [];

    if (basicBaitCount > 0) {
      options.push(
        new StringSelectMenuOptionBuilder()
          .setLabel("Isca Básica")
          .setDescription(`Peixes comuns e incomuns - Disponível: ${basicBaitCount}`)
          .setValue("basic")
          .setEmoji(getEmoji("basic_bait"))
          .setDefault(equippedBait === "basic")
      );
    }

    if (premiumBaitCount > 0) {
      options.push(
        new StringSelectMenuOptionBuilder()
          .setLabel("Isca Premium")
          .setDescription(`Aumenta chance de peixes raros! - Disponível: ${premiumBaitCount}`)
          .setValue("premium")
          .setEmoji(getEmoji("premium_bait"))
          .setDefault(equippedBait === "premium")
      );
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`select_bait_equip_${userId}`)
      .setPlaceholder(`${getEmoji("basic_bait")} Selecione uma isca...`)
      .addOptions(...options);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    await interaction.editReply({
      embeds: [selectEmbed],
      components: [row],
    });
  },
};
