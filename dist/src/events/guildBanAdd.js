"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.once = exports.name = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const modLogs_1 = require("../utils/modLogs");
exports.name = discord_js_1.Events.GuildBanAdd;
exports.once = false;
async function execute(ban) {
    const auditLogs = await ban.guild.fetchAuditLogs({
        limit: 1,
        type: 22,
    });
    const banLog = auditLogs.entries.first();
    const reason = banLog?.reason || undefined;
    await (0, modLogs_1.logMemberBan)(ban.guild, ban.user, reason);
}
//# sourceMappingURL=guildBanAdd.js.map