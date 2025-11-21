"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const territoryManager_1 = require("../../utils/territoryManager");
const customEmojis_1 = require("../../utils/customEmojis");
const i18n_1 = require("../../utils/i18n");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
const dataManager_1 = require("../../utils/dataManager");
const frameManager_1 = require("../../utils/frameManager");
exports.default = {
    data: (0, commandLocalizations_1.applyLocalizations)(new discord_js_1.SlashCommandBuilder()
        .setName("territories")
        .setDescription("🏛️ Browse and purchase valuable territories in the Wild West")
        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1]), "territories"),
    async execute(interaction) {
        const userId = interaction.user.id;
        let currentIndex = 0;
        let currentInteraction = interaction; // Track the current interaction for translations
        const silverEmoji = (0, customEmojis_1.getSilverCoinEmoji)();
        // Helper to get translated territory data
        const getTerritoryTranslation = (territoryId, field) => {
            return (0, i18n_1.t)(currentInteraction, `territory_${territoryId}_${field}`);
        };
        // Function to create embed for current territory
        const createTerritoryEmbed = (index) => {
            // Always fetch fresh data
            const userSilver = (0, dataManager_1.getUserSilver)(userId);
            const ownedTerritories = (0, territoryManager_1.getUserTerritories)(userId);
            const territory = territoryManager_1.TERRITORIES[index];
            const owned = (0, territoryManager_1.ownsTerritory)(userId, territory.id);
            // Get translated data
            const territoryName = getTerritoryTranslation(territory.id, "name");
            const territoryDesc = getTerritoryTranslation(territory.id, "desc");
            // Build benefits list from translations (filter empty ones)
            const benefits = [
                getTerritoryTranslation(territory.id, "benefit_1"),
                getTerritoryTranslation(territory.id, "benefit_2"),
            ].filter((b) => b && b.trim().length > 0);
            const benefitsText = benefits.join("\n");
            const embed = new discord_js_1.EmbedBuilder()
                .setColor(territory.color)
                .setTitle(`${territory.emoji} ${territoryName.toUpperCase()}`)
                .setDescription(territoryDesc)
                .addFields({
                name: `${(0, customEmojis_1.getMoneybagEmoji)()} ${(0, i18n_1.t)(currentInteraction, "territories_price")}`,
                value: `${territory.price.toLocaleString()} ${silverEmoji} ${(0, i18n_1.t)(currentInteraction, "silver_coins")}`,
                inline: true,
            }, {
                name: `${(0, customEmojis_1.getDartEmoji)()} ${(0, i18n_1.t)(currentInteraction, "territories_rarity")}`,
                value: (0, i18n_1.t)(currentInteraction, `rarity_${territory.rarity}`),
                inline: true,
            }, {
                name: `${(0, customEmojis_1.getStatsEmoji)()} ${(0, i18n_1.t)(currentInteraction, "territories_status")}`,
                value: owned
                    ? `${(0, customEmojis_1.getCheckEmoji)()} **${(0, i18n_1.t)(currentInteraction, "territories_owned")}**`
                    : userSilver >= territory.price
                        ? `${(0, customEmojis_1.getGreenCircle)()} **${(0, i18n_1.t)(currentInteraction, "territories_available")}**`
                        : `${(0, customEmojis_1.getRedCircle)()} **${(0, i18n_1.t)(currentInteraction, "territories_insufficient")}**`,
                inline: true,
            }, {
                name: `${(0, customEmojis_1.getGiftEmoji)()} ${(0, i18n_1.t)(currentInteraction, "territories_benefits")}`,
                value: benefitsText,
                inline: false,
            })
                .setFooter({
                text: (0, i18n_1.t)(currentInteraction, "territories_footer", {
                    current: index + 1,
                    total: territoryManager_1.TERRITORIES.length,
                    owned: ownedTerritories.length,
                }),
            })
                .setTimestamp();
            // Add image if available
            if (territory.image) {
                embed.setImage(territory.image);
            }
            return embed;
        };
        // Function to create navigation buttons
        const createButtons = (index) => {
            // Always fetch fresh data
            const userSilver = (0, dataManager_1.getUserSilver)(userId);
            const ownedTerritories = (0, territoryManager_1.getUserTerritories)(userId);
            const territory = territoryManager_1.TERRITORIES[index];
            const owned = (0, territoryManager_1.ownsTerritory)(userId, territory.id);
            const canAfford = userSilver >= territory.price;
            const row1 = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId("prev")
                .setLabel((0, i18n_1.t)(currentInteraction, "territories_prev"))
                .setStyle(discord_js_1.ButtonStyle.Secondary)
                .setDisabled(index === 0), new discord_js_1.ButtonBuilder()
                .setCustomId("purchase")
                .setLabel(owned
                ? (0, i18n_1.t)(currentInteraction, "territories_owned")
                : (0, i18n_1.t)(currentInteraction, "territories_buy", {
                    price: (territory.price / 1000).toFixed(0),
                }))
                .setStyle(owned
                ? discord_js_1.ButtonStyle.Success
                : canAfford
                    ? discord_js_1.ButtonStyle.Primary
                    : discord_js_1.ButtonStyle.Danger)
                .setDisabled(owned || !canAfford), new discord_js_1.ButtonBuilder()
                .setCustomId("next")
                .setLabel((0, i18n_1.t)(currentInteraction, "territories_next"))
                .setStyle(discord_js_1.ButtonStyle.Secondary)
                .setDisabled(index === territoryManager_1.TERRITORIES.length - 1));
            const row2 = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId("my_territories")
                .setLabel((0, i18n_1.t)(currentInteraction, "territories_my_territories"))
                .setStyle(discord_js_1.ButtonStyle.Success)
                .setDisabled(ownedTerritories.length === 0), new discord_js_1.ButtonBuilder()
                .setCustomId("close")
                .setLabel((0, i18n_1.t)(currentInteraction, "territories_close"))
                .setStyle(discord_js_1.ButtonStyle.Danger));
            return [row1, row2];
        };
        // Send initial message
        const initialEmbed = createTerritoryEmbed(currentIndex);
        const initialButtons = createButtons(currentIndex);
        const response = await interaction.reply({
            embeds: [initialEmbed],
            components: initialButtons,
        });
        // Create collector
        const collector = response.createMessageComponentCollector({
            componentType: discord_js_1.ComponentType.Button,
            time: 300000, // 5 minutes
        });
        collector.on("collect", async (i) => {
            // Update current interaction for translations
            currentInteraction = i;
            // Only allow the command user to interact
            if (i.user.id !== userId) {
                return i.reply({
                    content: `${(0, customEmojis_1.getCancelEmoji)()} ${(0, i18n_1.t)(i, "territories_not_yours")}`,
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
            }
            if (i.customId === "prev") {
                currentIndex = Math.max(0, currentIndex - 1);
                await i.update({
                    embeds: [createTerritoryEmbed(currentIndex)],
                    components: createButtons(currentIndex),
                });
            }
            else if (i.customId === "next") {
                currentIndex = Math.min(territoryManager_1.TERRITORIES.length - 1, currentIndex + 1);
                await i.update({
                    embeds: [createTerritoryEmbed(currentIndex)],
                    components: createButtons(currentIndex),
                });
            }
            else if (i.customId === "purchase") {
                const territory = territoryManager_1.TERRITORIES[currentIndex];
                const currentSilver = (0, dataManager_1.getUserSilver)(userId);
                // Double-check affordability
                if (currentSilver < territory.price) {
                    return i.reply({
                        content: `${(0, customEmojis_1.getCancelEmoji)()} ${(0, i18n_1.t)(i, "territories_need_more", { amount: (territory.price - currentSilver).toLocaleString() })} ${silverEmoji}`,
                        flags: discord_js_1.MessageFlags.Ephemeral,
                    });
                }
                // Double-check ownership
                if ((0, territoryManager_1.ownsTerritory)(userId, territory.id)) {
                    return i.reply({
                        content: `${(0, customEmojis_1.getCancelEmoji)()} ${(0, i18n_1.t)(i, "territories_already_own")}`,
                        flags: discord_js_1.MessageFlags.Ephemeral,
                    });
                }
                // Process purchase
                const removed = await (0, dataManager_1.removeUserSilver)(userId, territory.price);
                if (!removed) {
                    return i.reply({
                        content: `${(0, customEmojis_1.getCancelEmoji)()} ${(0, i18n_1.t)(i, "territories_transaction_failed")}`,
                        flags: discord_js_1.MessageFlags.Ephemeral,
                    });
                }
                const success = (0, territoryManager_1.purchaseTerritory)(userId, territory.id, territory.price);
                if (!success) {
                    // Refund if purchase failed
                    const { addUserSilver } = require("../../utils/dataManager");
                    await addUserSilver(userId, territory.price);
                    return i.reply({
                        content: `${(0, customEmojis_1.getCancelEmoji)()} ${(0, i18n_1.t)(i, "territories_purchase_failed")}`,
                        flags: discord_js_1.MessageFlags.Ephemeral,
                    });
                }
                // Unlock exclusive frames for this territory
                (0, frameManager_1.unlockFrameByTerritory)(userId, territory.id);
                // Success!
                const territoryName = getTerritoryTranslation(territory.id, "name");
                const purchaseBenefits = [
                    getTerritoryTranslation(territory.id, "benefit_1"),
                    getTerritoryTranslation(territory.id, "benefit_2"),
                ].filter((b) => b && b.trim().length > 0);
                const purchaseBenefitsText = purchaseBenefits.join("\n");
                const successEmbed = new discord_js_1.EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle(`${(0, customEmojis_1.getPartyEmoji)()} ${(0, i18n_1.t)(i, "territories_purchased_title")}`)
                    .setDescription((0, i18n_1.t)(i, "territories_purchased_desc", {
                    name: `${territory.emoji} ${territoryName}`,
                }))
                    .addFields({
                    name: `${(0, customEmojis_1.getMoneybagEmoji)()} ${(0, i18n_1.t)(i, "territories_amount_paid")}`,
                    value: `${territory.price.toLocaleString()} ${silverEmoji} ${(0, i18n_1.t)(i, "silver_coins")}`,
                    inline: true,
                }, {
                    name: `${(0, customEmojis_1.getMoneybagEmoji)()} ${(0, i18n_1.t)(i, "territories_remaining_balance")}`,
                    value: `${(currentSilver - territory.price).toLocaleString()} ${silverEmoji}`,
                    inline: true,
                }, {
                    name: `${(0, customEmojis_1.getGiftEmoji)()} ${(0, i18n_1.t)(i, "territories_benefits_unlocked")}`,
                    value: purchaseBenefitsText,
                    inline: false,
                })
                    .setFooter({
                    text: (0, i18n_1.t)(i, "territories_now_own", {
                        count: (0, territoryManager_1.getTerritoryCount)(userId),
                    }),
                })
                    .setTimestamp();
                await i.reply({
                    embeds: [successEmbed],
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
                // Update the main message
                await interaction.editReply({
                    embeds: [createTerritoryEmbed(currentIndex)],
                    components: createButtons(currentIndex),
                });
            }
            else if (i.customId === "my_territories") {
                const owned = (0, territoryManager_1.getUserTerritories)(userId);
                const territoriesInfo = owned
                    .map((id) => {
                    const terr = (0, territoryManager_1.getTerritory)(id);
                    if (!terr)
                        return null;
                    const terrName = getTerritoryTranslation(terr.id, "name");
                    const terrRarity = (0, i18n_1.t)(i, `rarity_${terr.rarity}`);
                    return `${terr.emoji} **${terrName}** - ${terrRarity}`;
                })
                    .filter(Boolean)
                    .join("\n");
                const myTerritoriesEmbed = new discord_js_1.EmbedBuilder()
                    .setColor(0xffd700)
                    .setTitle(`${(0, customEmojis_1.getBuildingEmoji)()} ${(0, i18n_1.t)(i, "territories_my_title")}`)
                    .setDescription(territoriesInfo || (0, i18n_1.t)(i, "territories_no_territories"))
                    .addFields({
                    name: `${(0, customEmojis_1.getStatsEmoji)()} ${(0, i18n_1.t)(i, "territories_statistics")}`,
                    value: (0, i18n_1.t)(i, "territories_owned_count", {
                        owned: owned.length,
                        total: territoryManager_1.TERRITORIES.length,
                        percentage: Math.round((owned.length / territoryManager_1.TERRITORIES.length) * 100),
                    }),
                    inline: false,
                })
                    .setFooter({ text: (0, i18n_1.t)(i, "territories_keep_expanding") })
                    .setTimestamp();
                await i.reply({
                    embeds: [myTerritoriesEmbed],
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
            }
            else if (i.customId === "close") {
                await i.update({
                    content: (0, i18n_1.t)(i, "territories_browser_closed"),
                    embeds: [],
                    components: [],
                });
                collector.stop();
            }
        });
        collector.on("end", async (collected) => {
            if (collected.size === 0) {
                await interaction
                    .editReply({
                    components: [],
                })
                    .catch(() => { });
            }
        });
    },
};
//# sourceMappingURL=territories.js.map