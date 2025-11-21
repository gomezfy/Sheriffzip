"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.once = exports.name = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const modLogs_1 = require("../utils/modLogs");
exports.name = discord_js_1.Events.MessageUpdate;
exports.once = false;
async function execute(oldMessage, newMessage) {
    if (oldMessage.partial) {
        try {
            await oldMessage.fetch();
        }
        catch (error) {
            return;
        }
    }
    if (newMessage.partial) {
        try {
            await newMessage.fetch();
        }
        catch (error) {
            return;
        }
    }
    await (0, modLogs_1.logMessageEdit)(oldMessage, newMessage);
}
//# sourceMappingURL=messageUpdate.js.map