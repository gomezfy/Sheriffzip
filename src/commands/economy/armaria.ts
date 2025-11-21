import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  AttachmentBuilder,
} from "discord.js";
import { ITEMS } from "../../utils/inventoryManager";
import { generateWeaponCard } from "../../utils/weaponCanvas";
import { applyLocalizations } from "../../utils/commandLocalizations";
import { addItem } from "../../utils/inventoryManager";
import { getUserSilver, removeUserSilver, addUserSilver } from "../../utils/dataManager";
import {
  getCowboyEmoji,
  getStatsEmoji,
  getBalanceEmoji,
  getSilverCoinEmoji,
  getMoneybagEmoji,
  getBackpackEmoji,
  getClockEmoji,
  getRevolverEmoji,
} from "../../utils/customEmojis";

const weapons = [
  {
    id: "escopeta",
    ...ITEMS.escopeta,
  },
  {
    id: "revolver_vaqueiro",
    ...ITEMS.revolver_vaqueiro,
  },
  {
    id: "revolver_38",
    ...ITEMS.revolver_38,
  },
  {
    id: "rifle_de_caca",
    ...ITEMS.rifle_de_caca,
  },
  {
    id: "fishing_rod",
    ...ITEMS.fishing_rod,
  },
];

const commandBuilder = new SlashCommandBuilder()
  .setName("armaria")
  .setDescription("🔫 Visite a armaria e compre armas poderosas")
  .setContexts([0, 1, 2])
  .setIntegrationTypes([0, 1]);

export default {
  data: applyLocalizations(commandBuilder, "armaria"),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    let currentIndex = 0;

    const updateMessage = async () => {
      const weapon = weapons[currentIndex];

      let weaponImage: Buffer;
      try {
        weaponImage = await generateWeaponCard({
          name: weapon.name,
          damage: weapon.damage!,
          imageUrl: weapon.imageUrl!,
          price: weapon.price!,
          currency: weapon.currency!,
          description: weapon.description,
        });
      } catch (error) {
        console.error("Error generating weapon card:", error);
        await interaction.editReply({
          content: "❌ Erro ao carregar a imagem da arma. Tente novamente em alguns instantes.",
        });
        throw error;
      }

      const attachment = new AttachmentBuilder(weaponImage, {
        name: "weapon.png",
      });

      const cowboyEmoji = getCowboyEmoji();
      const statsEmoji = getStatsEmoji();
      const balanceEmoji = getBalanceEmoji();
      const silverCoinEmoji = getSilverCoinEmoji();

      const embed = new EmbedBuilder()
        .setColor(0x8b6f47)
        .setTitle(`${cowboyEmoji} Armaria do Velho Oeste`)
        .setDescription(
          `**${weapon.name}**\n\n` +
          `${weapon.description}\n\n` +
          `**${statsEmoji} Estatísticas:**\n` +
          `💥 **Dano:** ${weapon.damage}\n` +
          `${balanceEmoji} **Peso:** ${weapon.weight} kg\n` +
          `${silverCoinEmoji} **Preço:** ${weapon.price?.toLocaleString()} ${weapon.currency === "silver" ? "moedas de prata" : "ouro"}\n\n` +
          `**Arma ${currentIndex + 1} de ${weapons.length}**`
        )
        .setImage("attachment://weapon.png")
        .setFooter({
          text: "Use os botões para navegar e comprar • Sheriff Rex Bot",
        })
        .setTimestamp();

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("Anterior")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentIndex === 0),
        new ButtonBuilder()
          .setCustomId("buy")
          .setLabel("Comprar")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Próxima")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentIndex === weapons.length - 1)
      );

      return { embeds: [embed], files: [attachment], components: [row] };
    };

    const initialMessage = await updateMessage();
    const response = await interaction.editReply(initialMessage);

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000,
    });

    collector.on("collect", async (buttonInteraction) => {
      if (buttonInteraction.user.id !== interaction.user.id) {
        await buttonInteraction.reply({
          content: "❌ Esta armaria não é para você! Use `/armaria` para abrir sua própria loja.",
          ephemeral: true,
        });
        return;
      }

      if (buttonInteraction.customId === "previous") {
        currentIndex = Math.max(0, currentIndex - 1);
        await buttonInteraction.deferUpdate();
        const updatedMessage = await updateMessage();
        await buttonInteraction.editReply(updatedMessage);
      } else if (buttonInteraction.customId === "next") {
        currentIndex = Math.min(weapons.length - 1, currentIndex + 1);
        await buttonInteraction.deferUpdate();
        const updatedMessage = await updateMessage();
        await buttonInteraction.editReply(updatedMessage);
      } else if (buttonInteraction.customId === "buy") {
        await buttonInteraction.deferUpdate();

        const weapon = weapons[currentIndex];
        const userId = interaction.user.id;

        const silverBalance = getUserSilver(userId);

        if (silverBalance < weapon.price!) {
          const silverCoinEmoji = getSilverCoinEmoji();
          const errorEmbed = new EmbedBuilder()
            .setColor(0xe74c3c)
            .setTitle("❌ Saldo Insuficiente")
            .setDescription(
              `Você não tem moedas de prata suficientes para comprar **${weapon.name}**!\n\n` +
              `**Seu saldo:** ${silverCoinEmoji} ${silverBalance.toLocaleString()}\n` +
              `**Preço:** ${silverCoinEmoji} ${weapon.price?.toLocaleString()}\n` +
              `**Faltam:** ${silverCoinEmoji} ${(weapon.price! - silverBalance).toLocaleString()}`
            )
            .setTimestamp();

          await buttonInteraction.followUp({
            embeds: [errorEmbed],
            ephemeral: true,
          });
          return;
        }

        await removeUserSilver(userId, weapon.price!);

        const result = await addItem(userId, weapon.id, 1);

        if (result.success) {
          const silverCoinEmoji = getSilverCoinEmoji();
          const moneybagEmoji = getMoneybagEmoji();
          const backpackEmoji = getBackpackEmoji();
          const successEmbed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle("✅ Compra Realizada!")
            .setDescription(
              `Você comprou **${weapon.name}** com sucesso!\n\n` +
              `${moneybagEmoji} **Pago:** ${silverCoinEmoji} ${weapon.price?.toLocaleString()} moedas de prata\n` +
              `💥 **Dano:** ${weapon.damage}\n` +
              `${backpackEmoji} **Adicionado ao inventário**\n\n` +
              `**Novo saldo:** ${silverCoinEmoji} ${(silverBalance - weapon.price!).toLocaleString()}`
            )
            .setTimestamp();

          await buttonInteraction.followUp({
            embeds: [successEmbed],
            ephemeral: true,
          });
        } else {
          await addUserSilver(userId, weapon.price!);

          const errorEmbed = new EmbedBuilder()
            .setColor(0xe74c3c)
            .setTitle("❌ Erro na Compra")
            .setDescription(
              result.error || "Não foi possível adicionar a arma ao seu inventário."
            )
            .setTimestamp();

          await buttonInteraction.followUp({
            embeds: [errorEmbed],
            ephemeral: true,
          });
        }
      }
    });

    collector.on("end", async (collected, reason) => {
      if (reason === "time" && collected.size === 0) {
        try {
          const revolverEmoji = getRevolverEmoji();
          const clockEmoji = getClockEmoji();
          const timeoutEmbed = new EmbedBuilder()
            .setColor(0x95a5a6)
            .setTitle(`${revolverEmoji} Armaria do Velho Oeste`)
            .setDescription(`${clockEmoji} Tempo esgotado. Use \`/armaria\` novamente para visitar a loja.`)
            .setTimestamp();

          await interaction.editReply({
            embeds: [timeoutEmbed],
            files: [],
            components: [],
          });
        } catch (error) {
          console.error("Error updating message after timeout:", error);
        }
      }
    });
  },
};
