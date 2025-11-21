import { ChatInputCommandInteraction } from "discord.js";
export declare function getEquippedBait(userId: string): string | null;
export declare function setEquippedBait(userId: string, baitType: string): void;
declare const _default: {
    data: any;
    cooldown: number;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
};
export default _default;
//# sourceMappingURL=iscar.d.ts.map