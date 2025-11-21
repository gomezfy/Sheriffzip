import { ChatInputCommandInteraction } from "discord.js";
interface Fish {
    name: string;
    emoji: string;
    rarity: string;
    rarityColor: string;
    chance: number;
    rewards: {
        fish: {
            id: string;
            amount: number;
        };
    };
    experience: number;
    difficulty: number;
    requiredCatches: number;
    imageUrl: string;
}
declare const FISHES: Fish[];
declare function selectFish(usePremiumBait?: boolean): Fish | null;
declare const _default: {
    data: any;
    cooldown: number;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
};
export default _default;
export { FISHES, selectFish };
//# sourceMappingURL=fish.d.ts.map