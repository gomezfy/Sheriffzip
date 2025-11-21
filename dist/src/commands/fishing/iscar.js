"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEquippedBait = getEquippedBait;
exports.setEquippedBait = setEquippedBait;
const discord_js_1 = require("discord.js");
const commandLocalizations_1 = require("../../utils/commandLocalizations");
const inventoryManager_1 = require("../../utils/inventoryManager");
const customEmojis_1 = require("../../utils/customEmojis");
const embeds_1 = require("../../utils/embeds");
const database_1 = require("../../utils/database");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dataDir = (0, database_1.getDataPath)("data");
const equippedBaitFile = path_1.default.join(dataDir, "equipped_bait.json");
function getEquippedBait(userId) {
    try {
        if (!fs_1.default.existsSync(equippedBaitFile)) {
            return null;
        }
        const data = JSON.parse(fs_1.default.readFileSync(equippedBaitFile, "utf-8"));
        return data[userId] || null;
    }
    catch {
        return null;
    }
}
function setEquippedBait(userId, baitType) {
    try {
        let data = {};
        if (fs_1.default.existsSync(equippedBaitFile)) {
            data = JSON.parse(fs_1.default.readFileSync(equippedBaitFile, "utf-8"));
        }
        data[userId] = baitType;
        fs_1.default.writeFileSync(equippedBaitFile, JSON.stringify(data, null, 2));
    }
    catch (error) {
        console.error("Erro ao salvar isca equipada:", error);
    }
}
exports.default = {
    data: (0, commandLocalizations_1.applyLocalizations)(new discord_js_1.SlashCommandBuilder()
        .setName("iscar")
        .setDescription("Equipar qual isca usar para pescar")
        .setContexts([0, 1, 2])
        .setIntegrationTypes([0, 1]), "iscar"),
    cooldown: 5,
    async execute(interaction) {
        await interaction.deferReply();
        const userId = interaction.user.id;
        const basicBaitCount = (0, inventoryManager_1.getItem)(userId, "basic_bait");
        const premiumBaitCount = (0, inventoryManager_1.getItem)(userId, "premium_bait");
        const equippedBait = getEquippedBait(userId);
        if (basicBaitCount === 0 && premiumBaitCount === 0) {
            const embed = (0, embeds_1.errorEmbed)(`${(0, customEmojis_1.getEmoji)("cancel")} Nenhuma Isca Disponível`, `${(0, customEmojis_1.getEmoji)("moneybag")} Compre iscas no **Hunter's Store** (\`/hunterstore\`)!`);
            await interaction.editReply({ embeds: [embed] });
            return;
        }
        const selectEmbed = new discord_js_1.EmbedBuilder()
            .setColor("#DAA520")
            .setTitle(`${(0, customEmojis_1.getEmoji)("basic_bait")} Selecionar Isca`)
            .setDescription(`Escolha qual isca deseja equipar para pescar:\n`)
            .setFooter({ text: "Clique no menu para selecionar" })
            .setTimestamp();
        const options = [];
        if (basicBaitCount > 0) {
            options.push(new discord_js_1.StringSelectMenuOptionBuilder()
                .setLabel("Isca Básica")
                .setDescription(`Peixes comuns e incomuns - Disponível: ${basicBaitCount}`)
                .setValue("basic")
                .setEmoji((0, customEmojis_1.getEmoji)("basic_bait"))
                .setDefault(equippedBait === "basic"));
        }
        if (premiumBaitCount > 0) {
            options.push(new discord_js_1.StringSelectMenuOptionBuilder()
                .setLabel("Isca Premium")
                .setDescription(`Aumenta chance de peixes raros! - Disponível: ${premiumBaitCount}`)
                .setValue("premium")
                .setEmoji((0, customEmojis_1.getEmoji)("premium_bait"))
                .setDefault(equippedBait === "premium"));
        }
        const selectMenu = new discord_js_1.StringSelectMenuBuilder()
            .setCustomId(`select_bait_equip_${userId}`)
            .setPlaceholder(`${(0, customEmojis_1.getEmoji)("basic_bait")} Selecione uma isca...`)
            .addOptions(...options);
        const row = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
        await interaction.editReply({
            embeds: [selectEmbed],
            components: [row],
        });
    },
};
//# sourceMappingURL=iscar.js.map