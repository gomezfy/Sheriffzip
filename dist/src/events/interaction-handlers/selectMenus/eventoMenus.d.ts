import { StringSelectMenuInteraction, ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
/**
 * Factory function to create the evento select menu
 * This ensures consistency across all interactions
 */
export declare function createEventoSelectMenu(): ActionRowBuilder<StringSelectMenuBuilder>;
/**
 * Handler for evento select menu
 */
export declare function handleEventoSelectMenu(interaction: StringSelectMenuInteraction): Promise<void>;
//# sourceMappingURL=eventoMenus.d.ts.map