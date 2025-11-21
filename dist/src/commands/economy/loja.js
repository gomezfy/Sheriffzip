"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const mercadoPagoService_1 = require("../../utils/mercadoPagoService");
const customEmojis_1 = require("../../utils/customEmojis");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
const commandBuilder = new discord_js_1.SlashCommandBuilder()
    .setName("loja")
    .setDescription("🛒 Compre RexBucks com PIX ou Cartão")
    .setContexts([0, 1, 2])
    .setIntegrationTypes([0, 1]);
exports.default = {
    data: (0, commandLocalizations_1.applyLocalizations)(commandBuilder, "loja"),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        try {
            const packages = await (0, mercadoPagoService_1.getActivePackages)();
            if (packages.length === 0) {
                const embed = new discord_js_1.EmbedBuilder()
                    .setColor(0xf39c12)
                    .setTitle(`${(0, customEmojis_1.getInfoEmoji)()} Loja Indisponível`)
                    .setDescription("Nenhum pacote de RexBucks disponível no momento. Tente novamente mais tarde.")
                    .setTimestamp();
                await interaction.editReply({ embeds: [embed] });
                return;
            }
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(0x3498db)
                .setTitle(`${(0, customEmojis_1.getMoneybagEmoji)()} 🤠 Loja de RexBucks - Sheriff Rex`)
                .setDescription(`**Compre RexBucks e desbloqueie recursos premium!**\n\n` +
                `${(0, customEmojis_1.getRexBuckEmoji)()} **RexBucks** é a moeda premium do servidor\n` +
                `💳 Aceita **PIX** e **Cartão de Crédito**\n` +
                `⚡ Crédito **instantâneo** após aprovação do pagamento\n\n` +
                `**📦 Pacotes Disponíveis:**`)
                .setFooter({
                text: "Clique em um pacote para comprar • Pagamento via Mercado Pago",
            })
                .setTimestamp();
            packages.forEach((pkg, index) => {
                const bonus = pkg.bonusRexBucks > 0 ? ` (+${pkg.bonusRexBucks} bônus!)` : '';
                embed.addFields({
                    name: `${index + 1}. ${pkg.name} - ${pkg.displayPrice}`,
                    value: `${(0, customEmojis_1.getRexBuckEmoji)()} **${pkg.totalRexBucks.toLocaleString()} RexBucks**${bonus}\n` +
                        `📝 ${pkg.description}`,
                    inline: false,
                });
            });
            const rows = [];
            let currentRow = new discord_js_1.ActionRowBuilder();
            packages.forEach((pkg, index) => {
                if (index > 0 && index % 5 === 0) {
                    rows.push(currentRow);
                    currentRow = new discord_js_1.ActionRowBuilder();
                }
                currentRow.addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId(`buy_rexbucks_${pkg.id}`)
                    .setLabel(`${pkg.name}`)
                    .setStyle(discord_js_1.ButtonStyle.Success)
                    .setEmoji('💰'));
            });
            if (currentRow.components.length > 0) {
                rows.push(currentRow);
            }
            const response = await interaction.editReply({
                embeds: [embed],
                components: rows,
            });
            const collector = response.createMessageComponentCollector({
                componentType: discord_js_1.ComponentType.Button,
                time: 300000,
            });
            collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.user.id !== interaction.user.id) {
                    await buttonInteraction.reply({
                        content: '❌ Esta loja não é para você! Use `/loja` para abrir sua própria loja.',
                        ephemeral: true,
                    });
                    return;
                }
                const packageId = buttonInteraction.customId.replace('buy_rexbucks_', '');
                await buttonInteraction.deferUpdate();
                const selectedPackage = packages.find(p => p.id === packageId);
                if (!selectedPackage) {
                    await buttonInteraction.followUp({
                        content: '❌ Pacote não encontrado.',
                        ephemeral: true,
                    });
                    return;
                }
                const confirmEmbed = new discord_js_1.EmbedBuilder()
                    .setColor(0xf39c12)
                    .setTitle('⏳ Gerando Link de Pagamento...')
                    .setDescription(`**Pacote:** ${selectedPackage.name}\n` +
                    `**Valor:** ${selectedPackage.displayPrice}\n` +
                    `**RexBucks:** ${(0, customEmojis_1.getRexBuckEmoji)()} ${selectedPackage.totalRexBucks.toLocaleString()}\n\n` +
                    `Aguarde enquanto geramos seu link de pagamento...`)
                    .setTimestamp();
                await buttonInteraction.editReply({
                    embeds: [confirmEmbed],
                    components: [],
                });
                const result = await (0, mercadoPagoService_1.createPaymentPreference)(interaction.user.id, interaction.user.username, packageId);
                if (result.success && result.url) {
                    const successEmbed = new discord_js_1.EmbedBuilder()
                        .setColor(0x2ecc71)
                        .setTitle('✅ Link de Pagamento Gerado!')
                        .setDescription(`**Pacote:** ${selectedPackage.name}\n` +
                        `**Valor:** ${selectedPackage.displayPrice}\n` +
                        `**RexBucks:** ${(0, customEmojis_1.getRexBuckEmoji)()} ${selectedPackage.totalRexBucks.toLocaleString()}\n\n` +
                        `🔗 **[CLIQUE AQUI PARA PAGAR](${result.url})**\n\n` +
                        `💳 **Formas de Pagamento:**\n` +
                        `• PIX (aprovação instantânea)\n` +
                        `• Cartão de Crédito (até 12x)\n` +
                        `• Boleto Bancário\n\n` +
                        `⚡ Após a aprovação do pagamento, seus RexBucks serão creditados automaticamente!\n` +
                        `📧 Você receberá uma notificação quando o pagamento for aprovado.`)
                        .setFooter({
                        text: "Link válido por 30 minutos • Pagamento seguro via Mercado Pago",
                    })
                        .setTimestamp();
                    const payButton = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                        .setLabel('💳 Abrir Pagamento')
                        .setStyle(discord_js_1.ButtonStyle.Link)
                        .setURL(result.url));
                    await buttonInteraction.editReply({
                        embeds: [successEmbed],
                        components: [payButton],
                    });
                }
                else {
                    const errorEmbed = new discord_js_1.EmbedBuilder()
                        .setColor(0xe74c3c)
                        .setTitle('❌ Erro ao Gerar Pagamento')
                        .setDescription(result.error || 'Não foi possível gerar o link de pagamento. Tente novamente mais tarde.')
                        .setTimestamp();
                    await buttonInteraction.editReply({
                        embeds: [errorEmbed],
                        components: [],
                    });
                }
                collector.stop();
            });
            collector.on('end', async (collected, reason) => {
                if (reason === 'time' && collected.size === 0) {
                    try {
                        const timeoutEmbed = new discord_js_1.EmbedBuilder()
                            .setColor(0x95a5a6)
                            .setTitle(`${(0, customEmojis_1.getMoneybagEmoji)()} Loja de RexBucks`)
                            .setDescription('⏰ Tempo esgotado. Use `/loja` novamente para fazer uma compra.')
                            .setTimestamp();
                        await interaction.editReply({
                            embeds: [timeoutEmbed],
                            components: [],
                        });
                    }
                    catch (error) {
                        console.error('Error updating message after timeout:', error);
                    }
                }
            });
        }
        catch (error) {
            console.error("Error in loja command:", error);
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(0xe74c3c)
                .setTitle("❌ Erro")
                .setDescription("Ocorreu um erro ao carregar a loja. Tente novamente mais tarde.")
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
//# sourceMappingURL=loja.js.map