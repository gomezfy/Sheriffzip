import { ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../types";
export declare const data: import("discord.js").SlashCommandOptionsOnlyBuilder;
export declare function execute(interaction: ChatInputCommandInteraction): Promise<void>;
export declare const cooldown = 30;
declare const command: Command;
export default command;
//# sourceMappingURL=duel.d.ts.map