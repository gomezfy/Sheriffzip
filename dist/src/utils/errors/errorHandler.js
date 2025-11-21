"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleInteractionError = handleInteractionError;
exports.logError = logError;
const BaseBotError_1 = require("./BaseBotError");
const i18n_1 = require("../i18n");
async function handleInteractionError(interaction, error) {
    console.error(`Error in interaction ${interaction.id}:`, error);
    let errorMessage;
    let ephemeral = true;
    if (error instanceof BaseBotError_1.CooldownError) {
        errorMessage = (0, i18n_1.t)(interaction, "cooldown", {
            time: formatTime(error.remainingTime),
        });
    }
    else if (error instanceof BaseBotError_1.InventoryFullError) {
        errorMessage = (0, i18n_1.t)(interaction, "inventory_full");
    }
    else if (error instanceof BaseBotError_1.BaseBotError) {
        errorMessage = error.message;
    }
    else if (error instanceof Error) {
        errorMessage = (0, i18n_1.t)(interaction, "error");
        console.error(`Unexpected error: ${error.stack}`);
    }
    else {
        errorMessage = (0, i18n_1.t)(interaction, "error");
        console.error(`Unknown error:`, error);
    }
    try {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: errorMessage,
                ephemeral,
            });
        }
        else {
            await interaction.reply({
                content: errorMessage,
                ephemeral,
            });
        }
    }
    catch (replyError) {
        console.error("Failed to send error message:", replyError);
    }
}
function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
}
function logError(context, error) {
    const timestamp = new Date().toISOString();
    const errorInfo = error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
        }
        : { raw: error };
    console.error(`[${timestamp}] ${context}:`, errorInfo);
}
//# sourceMappingURL=errorHandler.js.map