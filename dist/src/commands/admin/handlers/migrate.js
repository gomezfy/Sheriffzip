"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMigrate = handleMigrate;
const discord_js_1 = require("discord.js");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const inventoryManager_1 = require("../../../utils/inventoryManager");
const OWNER_ID = process.env.OWNER_ID;
const economyFile = path.join(__dirname, "..", "..", "..", "..", "data", "economy.json");
const backupFile = path.join(__dirname, "..", "..", "..", "..", "data", "economy.backup.json");
async function handleMigrate(interaction) {
    if (interaction.user.id !== OWNER_ID) {
        await interaction.reply({
            content: "❌ This command is only available to the bot owner!",
            flags: [discord_js_1.MessageFlags.Ephemeral],
        });
        return;
    }
    await interaction.deferReply({ flags: discord_js_1.MessageFlags.Ephemeral });
    try {
        if (!fs.existsSync(economyFile)) {
            await interaction.editReply({
                content: "❌ Economy file not found! Nothing to migrate.",
            });
            return;
        }
        const economyData = JSON.parse(fs.readFileSync(economyFile, "utf8"));
        let migrated = 0;
        let failed = 0;
        const errors = [];
        for (const [userId, balance] of Object.entries(economyData)) {
            if (balance > 0) {
                const result = await (0, inventoryManager_1.addItem)(userId, "saloon_token", balance);
                if (result.success) {
                    migrated++;
                }
                else {
                    failed++;
                    errors.push(`User ${userId}: ${result.error}`);
                }
            }
        }
        fs.copyFileSync(economyFile, backupFile);
        fs.writeFileSync(economyFile, JSON.stringify({}, null, 2));
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(failed > 0 ? "#FFD700" : "#00FF00")
            .setTitle("✅ Migration Complete!")
            .setDescription(`Successfully migrated old economy balances to inventory system.`)
            .addFields({
            name: "✅ Successfully Migrated",
            value: `${migrated} users`,
            inline: true,
        }, { name: "❌ Failed", value: `${failed} users`, inline: true }, { name: "📁 Backup", value: `economy.backup.json`, inline: false })
            .setTimestamp();
        if (errors.length > 0 && errors.length <= 5) {
            embed.addFields({
                name: "⚠️ Errors",
                value: errors.slice(0, 5).join("\n"),
            });
        }
        await interaction.editReply({ embeds: [embed] });
    }
    catch (error) {
        console.error("Migration error:", error);
        await interaction.editReply({
            content: `❌ Migration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
    }
}
//# sourceMappingURL=migrate.js.map