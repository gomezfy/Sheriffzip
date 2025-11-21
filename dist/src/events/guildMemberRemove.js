"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.once = exports.name = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const modLogs_1 = require("../utils/modLogs");
exports.name = discord_js_1.Events.GuildMemberRemove;
exports.once = false;
async function execute(member) {
    if (member.partial) {
        try {
            await member.fetch();
        }
        catch (error) {
            return;
        }
    }
    await (0, modLogs_1.logMemberLeave)(member);
}
//# sourceMappingURL=guildMemberRemove.js.map