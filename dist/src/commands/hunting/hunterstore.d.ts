import { ChatInputCommandInteraction } from "discord.js";
interface HuntItem {
    id: string;
    name: string;
    emoji: string;
    price: number;
    rarity: string;
    rarityColor: string;
}
declare const MEAT_ITEMS: HuntItem[];
declare const PELT_ITEMS: HuntItem[];
declare const SPECIAL_ITEMS: HuntItem[];
declare const FISH_ITEMS: HuntItem[];
declare const SUPPLY_ITEMS: HuntItem[];
declare const _default: {
    data: any;
    cooldown: number;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
};
export default _default;
export { MEAT_ITEMS, PELT_ITEMS, FISH_ITEMS, SPECIAL_ITEMS, SUPPLY_ITEMS };
//# sourceMappingURL=hunterstore.d.ts.map