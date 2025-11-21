"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const inventoryManager_1 = require("../../utils/inventoryManager");
const weaponCanvas_1 = require("../../utils/weaponCanvas");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
const inventoryManager_2 = require("../../utils/inventoryManager");
const dataManager_1 = require("../../utils/dataManager");
const customEmojis_1 = require("../../utils/customEmojis");
const weapons = [
    {
        id: "escopeta",
        ...inventoryManager_1.ITEMS.escopeta,
    },
    {
        id: "revolver_vaqueiro",
        ...inventoryManager_1.ITEMS.revolver_vaqueiro,
    },
    {
        id: "revolver_38",
        ...inventoryManager_1.ITEMS.revolver_38,
    },
    {
        id: "rifle_de_caca",
        ...inventoryManager_1.ITEMS.rifle_de_caca,
    },
    {
        id: "fishing_rod",
        ...inventoryManager_1.ITEMS.fishing_rod,
    },
];
const commandBuilder = new discord_js_1.SlashCommandBuilder()
    .setName("armaria")
    .setDescription("🔫 Visite a armaria e compre armas poderosas")
    .setContexts([0, 1, 2])
    .setIntegrationTypes([0, 1]);
exports.default = {
    data: (0, commandLocalizations_1.applyLocalizations)(commandBuilder, "armaria"),
    async execute(interaction) {
        await interaction.deferReply();
        let currentIndex = 0;
        const updateMessage = async () => {
            const weapon = weapons[currentIndex];
            let weaponImage;
            try {
                weaponImage = await (0, weaponCanvas_1.generateWeaponCard)({
                    name: weapon.name,
                    damage: weapon.damage,
                    imageUrl: weapon.imageUrl,
                    price: weapon.price,
                    currency: weapon.currency,
                    description: weapon.description,
                });
            }
            catch (error) {
                console.error("Error generating weapon card:", error);
                await interaction.editReply({
                    content: "❌ Erro ao carregar a imagem da arma. Tente novamente em alguns instantes.",
                });
                throw error;
            }
            const attachment = new discord_js_1.AttachmentBuilder(weaponImage, {
                name: "weapon.png",
            });
            const cowboyEmoji = (0, customEmojis_1.getCowboyEmoji)();
            const statsEmoji = (0, customEmojis_1.getStatsEmoji)();
            const balanceEmoji = (0, customEmojis_1.getBalanceEmoji)();
            const silverCoinEmoji = (0, customEmojis_1.getSilverCoinEmoji)();
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(0x8b6f47)
                .setTitle(`${cowboyEmoji} Armaria do Velho Oeste`)
                .setDescription(`**${weapon.name}**\n\n` +
                `${weapon.description}\n\n` +
                `**${statsEmoji} Estatísticas:**\n` +
                `💥 **Dano:** ${weapon.damage}\n` +
                `${balanceEmoji} **Peso:** ${weapon.weight} kg\n` +
                `${silverCoinEmoji} **Preço:** ${weapon.price?.toLocaleString()} ${weapon.currency === "silver" ? "moedas de prata" : "ouro"}\n\n` +
                `**Arma ${currentIndex + 1} de ${weapons.length}**`)
                .setImage("attachment://weapon.png")
                .setFooter({
                text: "Use os botões para navegar e comprar • Sheriff Rex Bot",
            })
                .setTimestamp();
            const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId("previous")
                .setLabel("Anterior")
                .setStyle(discord_js_1.ButtonStyle.Secondary)
                .setDisabled(currentIndex === 0), new discord_js_1.ButtonBuilder()
                .setCustomId("buy")
                .setLabel("Comprar")
                .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
                .setCustomId("next")
                .setLabel("Próxima")
                .setStyle(discord_js_1.ButtonStyle.Secondary)
                .setDisabled(currentIndex === weapons.length - 1));
            return { embeds: [embed], files: [attachment], components: [row] };
        };
        const initialMessage = await updateMessage();
        const response = await interaction.editReply(initialMessage);
        const collector = response.createMessageComponentCollector({
            componentType: discord_js_1.ComponentType.Button,
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
            }
            else if (buttonInteraction.customId === "next") {
                currentIndex = Math.min(weapons.length - 1, currentIndex + 1);
                await buttonInteraction.deferUpdate();
                const updatedMessage = await updateMessage();
                await buttonInteraction.editReply(updatedMessage);
            }
            else if (buttonInteraction.customId === "buy") {
                await buttonInteraction.deferUpdate();
                const weapon = weapons[currentIndex];
                const userId = interaction.user.id;
                const silverBalance = (0, dataManager_1.getUserSilver)(userId);
                if (silverBalance < weapon.price) {
                    const silverCoinEmoji = (0, customEmojis_1.getSilverCoinEmoji)();
                    const errorEmbed = new discord_js_1.EmbedBuilder()
                        .setColor(0xe74c3c)
                        .setTitle("❌ Saldo Insuficiente")
                        .setDescription(`Você não tem moedas de prata suficientes para comprar **${weapon.name}**!\n\n` +
                        `**Seu saldo:** ${silverCoinEmoji} ${silverBalance.toLocaleString()}\n` +
                        `**Preço:** ${silverCoinEmoji} ${weapon.price?.toLocaleString()}\n` +
                        `**Faltam:** ${silverCoinEmoji} ${(weapon.price - silverBalance).toLocaleString()}`)
                        .setTimestamp();
                    await buttonInteraction.followUp({
                        embeds: [errorEmbed],
                        ephemeral: true,
                    });
                    return;
                }
                await (0, dataManager_1.removeUserSilver)(userId, weapon.price);
                const result = await (0, inventoryManager_2.addItem)(userId, weapon.id, 1);
                if (result.success) {
                    const silverCoinEmoji = (0, customEmojis_1.getSilverCoinEmoji)();
                    const moneybagEmoji = (0, customEmojis_1.getMoneybagEmoji)();
                    const backpackEmoji = (0, customEmojis_1.getBackpackEmoji)();
                    const successEmbed = new discord_js_1.EmbedBuilder()
                        .setColor(0x2ecc71)
                        .setTitle("✅ Compra Realizada!")
                        .setDescription(`Você comprou **${weapon.name}** com sucesso!\n\n` +
                        `${moneybagEmoji} **Pago:** ${silverCoinEmoji} ${weapon.price?.toLocaleString()} moedas de prata\n` +
                        `💥 **Dano:** ${weapon.damage}\n` +
                        `${backpackEmoji} **Adicionado ao inventário**\n\n` +
                        `**Novo saldo:** ${silverCoinEmoji} ${(silverBalance - weapon.price).toLocaleString()}`)
                        .setTimestamp();
                    await buttonInteraction.followUp({
                        embeds: [successEmbed],
                        ephemeral: true,
                    });
                }
                else {
                    await (0, dataManager_1.addUserSilver)(userId, weapon.price);
                    const errorEmbed = new discord_js_1.EmbedBuilder()
                        .setColor(0xe74c3c)
                        .setTitle("❌ Erro na Compra")
                        .setDescription(result.error || "Não foi possível adicionar a arma ao seu inventário.")
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
                    const revolverEmoji = (0, customEmojis_1.getRevolverEmoji)();
                    const clockEmoji = (0, customEmojis_1.getClockEmoji)();
                    const timeoutEmbed = new discord_js_1.EmbedBuilder()
                        .setColor(0x95a5a6)
                        .setTitle(`${revolverEmoji} Armaria do Velho Oeste`)
                        .setDescription(`${clockEmoji} Tempo esgotado. Use \`/armaria\` novamente para visitar a loja.`)
                        .setTimestamp();
                    await interaction.editReply({
                        embeds: [timeoutEmbed],
                        files: [],
                        components: [],
                    });
                }
                catch (error) {
                    console.error("Error updating message after timeout:", error);
                }
            }
        });
    },
};
//# sourceMappingURL=armaria.js.map