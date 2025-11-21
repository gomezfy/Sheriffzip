import { Events, Interaction } from "discord.js";
/**
 * ComponentRegistry Integration:
 *
 * The registry is now integrated and will be checked BEFORE legacy handlers.
 * All shop, carousel, and profile handlers have been migrated to the ComponentRegistry.
 *
 * ✅ FULLY MIGRATED:
 * - Profile handlers (edit_bio, edit_phrase, change_background, profile_show_public)
 * - Shop entry handlers (shop_backgrounds, shop_frames, change_frame)
 * - Carousel navigation (carousel_*, frame_carousel_*)
 * - Purchase handlers (buy_bg_*, buy_frame_*)
 *
 * See src/events/interaction-handlers/ for handler implementations.
 */
declare const _default: {
    name: Events;
    execute(interaction: Interaction): Promise<void>;
};
export = _default;
//# sourceMappingURL=interactionCreate.d.ts.map