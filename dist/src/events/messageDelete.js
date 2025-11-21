"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.once = exports.name = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const modLogs_1 = require("../utils/modLogs");
exports.name = discord_js_1.Events.MessageDelete;
exports.once = false;
async function execute(message) {
    if (message.partial) {
        try {
            await message.fetch();
        }
        catch (error) {
            return;
        }
    }
    await (0, modLogs_1.logMessageDelete)(message);
}
//# sourceMappingURL=messageDelete.js.map