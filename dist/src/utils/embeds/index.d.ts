export { BasicEmbedTemplates } from "./templates/basicEmbeds";
export { ThemeEmbedTemplates } from "./templates/themeEmbeds";
export { SpecialEmbedTemplates } from "./templates/specialEmbeds";
export { EmbedFieldBuilder } from "./builders/fieldBuilder";
export { formatNumber, formatTime, createProgressBar, truncateText, } from "./formatters";
import { BasicEmbedTemplates } from "./templates/basicEmbeds";
import { ThemeEmbedTemplates } from "./templates/themeEmbeds";
import { SpecialEmbedTemplates } from "./templates/specialEmbeds";
export declare class EmbedTemplates {
    static success: typeof BasicEmbedTemplates.success;
    static error: typeof BasicEmbedTemplates.error;
    static warning: typeof BasicEmbedTemplates.warning;
    static info: typeof BasicEmbedTemplates.info;
    static gold: typeof BasicEmbedTemplates.gold;
    static western: typeof ThemeEmbedTemplates.western;
    static bounty: typeof ThemeEmbedTemplates.bounty;
    static mining: typeof ThemeEmbedTemplates.mining;
    static leaderboard: typeof ThemeEmbedTemplates.leaderboard;
    static announcement: typeof ThemeEmbedTemplates.announcement;
    static profile: typeof SpecialEmbedTemplates.profile;
    static economy: typeof SpecialEmbedTemplates.economy;
    static cooldown: typeof SpecialEmbedTemplates.cooldown;
    static pagination: typeof SpecialEmbedTemplates.pagination;
}
//# sourceMappingURL=index.d.ts.map