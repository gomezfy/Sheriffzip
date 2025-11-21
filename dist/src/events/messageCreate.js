"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.once = exports.name = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const xpManager_1 = require("../utils/xpManager");
const levelRewards_1 = require("../utils/levelRewards");
const messageThrottler_1 = require("../utils/messageThrottler");
exports.name = discord_js_1.Events.MessageCreate;
exports.once = false;
async function execute(message) {
    if (message.author.bot || !message.guild || !message.member) {
        return;
    }
    if ((0, messageThrottler_1.canGainXp)(message.author.id)) {
        const xpAmount = Math.floor(Math.random() * 11) + 15;
        const result = (0, xpManager_1.addXp)(message.author.id, xpAmount);
        if (result.leveledUp) {
            try {
                const grantedRoles = await (0, levelRewards_1.checkAndGrantRewards)(message.member, result.newLevel);
                let replyText = `🎉 Parabéns ${message.author}! Você subiu para o nível **${result.newLevel}**!`;
                if (grantedRoles.length > 0) {
                    replyText += `\n🎁 Você ganhou ${grantedRoles.length > 1 ? "os roles" : "o role"}: **${grantedRoles.join(", ")}**!`;
                }
                if ("send" in message.channel) {
                    const levelUpMessage = await message.channel.send(replyText);
                    setTimeout(() => levelUpMessage.delete().catch(() => { }), 10000);
                }
            }
            catch (error) {
                console.error("Error handling level up:", error);
            }
        }
    }
}
//# sourceMappingURL=messageCreate.js.map