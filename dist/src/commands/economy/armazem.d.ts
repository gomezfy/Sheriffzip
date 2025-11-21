import { ButtonInteraction, StringSelectMenuInteraction } from "discord.js";
import { Command } from "../../types";
export declare function handleWarehouseButtons(interaction: ButtonInteraction): Promise<void>;
export declare function handleWarehouseSelects(interaction: StringSelectMenuInteraction): Promise<void>;
declare const _default: Command & {
    handleWarehouseButtons: typeof handleWarehouseButtons;
    handleWarehouseSelects: typeof handleWarehouseSelects;
};
export default _default;
//# sourceMappingURL=armazem.d.ts.map