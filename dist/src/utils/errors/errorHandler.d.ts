import { ChatInputCommandInteraction, ButtonInteraction, StringSelectMenuInteraction, ModalSubmitInteraction } from "discord.js";
type AnyInteraction = ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction;
export declare function handleInteractionError(interaction: AnyInteraction, error: unknown): Promise<void>;
export declare function logError(context: string, error: unknown): void;
export {};
//# sourceMappingURL=errorHandler.d.ts.map