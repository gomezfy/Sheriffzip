import { ButtonInteraction, StringSelectMenuInteraction } from "discord.js";
type ButtonHandler = (interaction: ButtonInteraction) => Promise<void>;
type SelectMenuHandler = (interaction: StringSelectMenuInteraction) => Promise<void>;
export declare class ComponentRegistry {
    private buttonHandlers;
    private buttonPatterns;
    private selectMenuHandlers;
    private selectMenuPatterns;
    registerButton(customId: string, handler: ButtonHandler, description?: string): void;
    registerButtonPattern(pattern: RegExp, handler: ButtonHandler, description?: string): void;
    registerSelectMenu(customId: string, handler: SelectMenuHandler, description?: string): void;
    registerSelectMenuPattern(pattern: RegExp, handler: SelectMenuHandler, description?: string): void;
    handleButton(interaction: ButtonInteraction): Promise<boolean>;
    handleSelectMenu(interaction: StringSelectMenuInteraction): Promise<boolean>;
    unregisterButton(customId: string): void;
    unregisterSelectMenu(customId: string): void;
    getRegisteredButtons(): string[];
    getRegisteredSelectMenus(): string[];
    clear(): void;
}
export declare const componentRegistry: ComponentRegistry;
export {};
//# sourceMappingURL=ComponentRegistry.d.ts.map