"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
exports.handleErrors = handleErrors;
const discord_js_1 = require("discord.js");
const types_1 = require("../types");
const security_1 = require("./security");
const logger_1 = __importDefault(require("./logger"));
/**
 * ErrorHandler - Centralized error handling system for bot commands
 *
 * Provides consistent error handling across all commands with:
 * - User-friendly error messages
 * - Secure error logging (sanitized to prevent information leakage)
 * - Support for different interaction states (replied, deferred, new)
 * - Custom error types for different domains (Economy, Inventory, Database)
 *
 * @example
 * ```typescript
 * try {
 *   await someRiskyOperation();
 * } catch (error) {
 *   await ErrorHandler.handleCommandError(error, interaction, 'commandName');
 * }
 * ```
 */
class ErrorHandler {
    /**
     * Handle command errors and send appropriate response to user
     * @param error - The error that occurred
     * @param interaction - The command interaction
     * @param commandName - The name of the command that failed
     */
    static async handleCommandError(error, interaction, commandName) {
        console.error(`Error executing ${commandName}:`, error);
        // Log the error securely
        if (interaction.guild) {
            logger_1.default.log(interaction.client, interaction.guild.id, "error", {
                command: commandName,
                user: interaction.user,
                error: (0, security_1.sanitizeErrorForLogging)(error),
            });
        }
        // Determine user-friendly error message
        let userMessage;
        if (error instanceof types_1.EconomyError) {
            userMessage = `💰 **Economy Error**\n${error.message}`;
        }
        else if (error instanceof types_1.InventoryError) {
            userMessage = `🎒 **Inventory Error**\n${error.message}`;
        }
        else if (error instanceof types_1.DatabaseError) {
            userMessage = `💾 **Database Error**\n${error.message}\n\nPlease try again later.`;
        }
        else if (error instanceof types_1.BotError) {
            userMessage = `⚠️ **Error**\n${error.message}`;
        }
        else if (error instanceof Error) {
            userMessage = `❌ **An error occurred**\n${error.message}`;
        }
        else {
            userMessage = "❌ An unexpected error occurred. Please try again later.";
        }
        // Send error message to user
        try {
            if (interaction.replied) {
                // Already replied, can't send error
                console.log(`Cannot send error message - interaction already replied`);
            }
            else if (interaction.deferred) {
                // Deferred, use editReply
                await interaction.editReply({ content: userMessage });
            }
            else {
                // Not replied or deferred, use reply
                await interaction.reply({
                    content: userMessage,
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
            }
        }
        catch (replyError) {
            console.error("Failed to send error message to user:", replyError);
        }
    }
    /**
     * Wrap an async function with error handling
     * @param fn - The async function to wrap
     * @param commandName - The name of the command
     * @returns Wrapped function with automatic error handling
     */
    static wrapCommand(fn, commandName) {
        return async (interaction) => {
            try {
                await fn(interaction);
            }
            catch (error) {
                await ErrorHandler.handleCommandError(error, interaction, commandName);
            }
        };
    }
    /**
     * Create a safe error message for users (hides sensitive details)
     * @param error - The error to create message from
     * @returns User-safe error message
     */
    static getSafeErrorMessage(error) {
        if (error instanceof types_1.BotError) {
            return error.message;
        }
        else if (error instanceof Error) {
            // Remove any potential sensitive information
            const safeMessage = error.message
                .replace(/\/home\/[^\s]+/g, "[path]")
                .replace(/token[^\s]*/gi, "[token]")
                .replace(/password[^\s]*/gi, "[password]")
                .replace(/secret[^\s]*/gi, "[secret]");
            return safeMessage;
        }
        return "An unexpected error occurred";
    }
    /**
     * Log error with context
     * @param error - The error to log
     * @param context - Additional context about the error
     */
    static logError(error, context = {}) {
        const errorInfo = {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            type: error instanceof Error ? error.constructor.name : typeof error,
            ...context,
        };
        console.error("Error logged:", JSON.stringify(errorInfo, null, 2));
    }
}
exports.ErrorHandler = ErrorHandler;
/**
 * Decorator for automatic error handling (TypeScript decorator)
 * Usage: @handleErrors('commandName')
 * @param commandName
 */
function handleErrors(commandName) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (interaction) {
            try {
                return await originalMethod.call(this, interaction);
            }
            catch (error) {
                await ErrorHandler.handleCommandError(error, interaction, commandName);
            }
        };
        return descriptor;
    };
}
//# sourceMappingURL=errorHandler.js.map