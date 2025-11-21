import { ChatInputCommandInteraction } from "discord.js";
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
export declare class ErrorHandler {
    /**
     * Handle command errors and send appropriate response to user
     * @param error - The error that occurred
     * @param interaction - The command interaction
     * @param commandName - The name of the command that failed
     */
    static handleCommandError(error: unknown, interaction: ChatInputCommandInteraction, commandName: string): Promise<void>;
    /**
     * Wrap an async function with error handling
     * @param fn - The async function to wrap
     * @param commandName - The name of the command
     * @returns Wrapped function with automatic error handling
     */
    static wrapCommand(fn: (interaction: ChatInputCommandInteraction) => Promise<void>, commandName: string): (interaction: ChatInputCommandInteraction) => Promise<void>;
    /**
     * Create a safe error message for users (hides sensitive details)
     * @param error - The error to create message from
     * @returns User-safe error message
     */
    static getSafeErrorMessage(error: unknown): string;
    /**
     * Log error with context
     * @param error - The error to log
     * @param context - Additional context about the error
     */
    static logError(error: unknown, context?: Record<string, any>): void;
}
/**
 * Decorator for automatic error handling (TypeScript decorator)
 * Usage: @handleErrors('commandName')
 * @param commandName
 */
export declare function handleErrors(commandName: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
//# sourceMappingURL=errorHandler.d.ts.map