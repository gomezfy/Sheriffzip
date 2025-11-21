import { ChatInputCommandInteraction } from "discord.js";
interface Animal {
    name: string;
    emoji: string;
    rarity: string;
    rarityColor: string;
    chance: number;
    rewards: {
        meat: {
            id: string;
            amount: number;
        };
        pelt?: {
            id: string;
            amount: number;
        };
        feather?: {
            id: string;
            amount: number;
        };
    };
    experience: number;
    requiredAccuracy: number;
    imageUrl: string;
}
declare const ANIMALS: Animal[];
declare function selectAnimal(): Animal | null;
declare function calculateShotAccuracy(): number;
declare const _default: {
    data: any;
    cooldown: number;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
};
export default _default;
export { ANIMALS, selectAnimal, calculateShotAccuracy };
//# sourceMappingURL=hunt.d.ts.map