import { LocalizationMap } from "discord.js";
export interface CommandLocalization {
    name: LocalizationMap;
    description: LocalizationMap;
}
export declare const commandLocalizations: Record<string, CommandLocalization>;
export declare function applyLocalizations(builder: any, commandName: string): any;
//# sourceMappingURL=commandLocalizations.d.ts.map