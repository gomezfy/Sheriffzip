import { ButtonInteraction, StringSelectMenuInteraction } from "discord.js";
/**
 * Handler para mover a barra para a esquerda
 */
export declare function handleFishLeft(interaction: ButtonInteraction): Promise<void>;
/**
 * Handler para mover a barra para a direita
 */
export declare function handleFishRight(interaction: ButtonInteraction): Promise<void>;
/**
 * Handler para tentar pegar o peixe
 */
export declare function handleFishCatch(interaction: ButtonInteraction): Promise<void>;
/**
 * Handler para menu de seleção de isca
 */
export declare function handleFishSelectBait(interaction: StringSelectMenuInteraction): Promise<void>;
//# sourceMappingURL=fishingHandlers.d.ts.map