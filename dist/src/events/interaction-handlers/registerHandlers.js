"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAllHandlers = registerAllHandlers;
const interactions_1 = require("../../interactions");
const profileHandlers_1 = require("./buttons/profileHandlers");
const shopHandlers_1 = require("./buttons/shopHandlers");
const profileMenus_1 = require("./selectMenus/profileMenus");
const teamCaptureHandlers_1 = require("./buttons/teamCaptureHandlers");
const eventHandlers_1 = require("./buttons/eventHandlers");
const generalStoreHandlers_1 = require("./buttons/generalStoreHandlers");
const huntHandlers_1 = require("./buttons/huntHandlers");
const hunterStoreHandlers_1 = require("./buttons/hunterStoreHandlers");
const hunterStoreMenus_1 = require("./selectMenus/hunterStoreMenus");
const fishingHandlers_1 = require("./buttons/fishingHandlers");
const eventoHandlers_1 = require("./buttons/eventoHandlers");
const eventoMenus_1 = require("./selectMenus/eventoMenus");
/**
 * Register all button and select menu handlers
 *
 * This function is called ONCE from the bot's ready event handler.
 *
 * HOW TO MIGRATE HANDLERS:
 *
 * 1. Extract handler logic from interactionCreate.ts
 * 2. Create file in src/events/interaction-handlers/buttons/ or selectMenus/
 * 3. Import the handler function here
 * 4. Register it using componentRegistry.registerButton() or registerSelectMenu()
 * 5. Test thoroughly
 * 6. Remove the legacy if-else block from interactionCreate.ts
 *
 * EXAMPLE:
 * ```typescript
 * import { handleEditBio } from './buttons/profileHandlers';
 * componentRegistry.registerButton('edit_bio', handleEditBio);
 * ```
 *
 * PATTERN-BASED HANDLERS:
 * ```typescript
 * componentRegistry.registerButtonPattern(/^carousel_/, handleCarousel);
 * componentRegistry.registerButtonPattern(/^buy_bg_/, handleBuyBackground);
 * ```
 */
function registerAllHandlers() {
    // ✅ MIGRATED HANDLERS (tested and working)
    // Profile buttons
    interactions_1.componentRegistry.registerButton('profile_show_public', profileHandlers_1.handleProfileShowPublic);
    interactions_1.componentRegistry.registerButton('edit_bio', profileHandlers_1.handleEditBio);
    interactions_1.componentRegistry.registerButton('edit_phrase', profileHandlers_1.handleEditPhrase);
    interactions_1.componentRegistry.registerButton('change_background', profileHandlers_1.handleChangeBackground);
    interactions_1.componentRegistry.registerButton('change_colors', profileHandlers_1.handleChangeColors);
    // Shop entry buttons
    interactions_1.componentRegistry.registerButton('shop_backgrounds', shopHandlers_1.handleShopBackgrounds);
    interactions_1.componentRegistry.registerButton('shop_frames', shopHandlers_1.handleShopFrames);
    interactions_1.componentRegistry.registerButton('change_frame', shopHandlers_1.handleChangeFrame);
    // Profile select menus
    interactions_1.componentRegistry.registerSelectMenu('select_color_theme', profileMenus_1.handleSelectColorTheme);
    // Carousel navigation patterns
    interactions_1.componentRegistry.registerButtonPattern(/^carousel_(next|prev)_\d+$/, shopHandlers_1.handleCarouselNavigation);
    interactions_1.componentRegistry.registerButtonPattern(/^frame_carousel_(next|prev)_\d+$/, shopHandlers_1.handleFrameCarouselNavigation);
    // Purchase patterns
    interactions_1.componentRegistry.registerButtonPattern(/^buy_frame_.+_\d+$/, shopHandlers_1.handleBuyFrame);
    interactions_1.componentRegistry.registerButtonPattern(/^buy_bg_.+_\d+$/, shopHandlers_1.handleBuyBackground);
    // Team capture buttons
    interactions_1.componentRegistry.registerButtonPattern(/^team_(join|leave|start|cancel)_.+$/, teamCaptureHandlers_1.handleTeamCaptureButtons);
    // Event buttons
    interactions_1.componentRegistry.registerButton('view_prizes', eventHandlers_1.handleViewPrizes);
    interactions_1.componentRegistry.registerButton('view_ranking', eventHandlers_1.handleViewRanking);
    // General Store handlers
    interactions_1.componentRegistry.registerButtonPattern(/^gstore_(next|prev)_\d+_.+$/, generalStoreHandlers_1.handleGeneralStoreNavigation);
    interactions_1.componentRegistry.registerButtonPattern(/^gstore_buy_.+_\d+_.+$/, generalStoreHandlers_1.handleGeneralStorePurchase);
    interactions_1.componentRegistry.registerButtonPattern(/^gstore_cat_.+_\d+$/, generalStoreHandlers_1.handleGeneralStoreCategory);
    // Hunt button handlers
    interactions_1.componentRegistry.registerButtonPattern(/^hunt_mode_solo_.+$/, huntHandlers_1.handleHuntModeSolo);
    interactions_1.componentRegistry.registerButtonPattern(/^hunt_mode_duo_.+$/, huntHandlers_1.handleHuntModeDuo);
    interactions_1.componentRegistry.registerButtonPattern(/^hunt_shoot_.+$/, huntHandlers_1.handleHuntShootButton);
    // Duo Hunt button handlers
    interactions_1.componentRegistry.registerButtonPattern(/^duo_hunt_accept_.+$/, huntHandlers_1.handleDuoHuntAccept);
    interactions_1.componentRegistry.registerButtonPattern(/^duo_hunt_cancel_.+$/, huntHandlers_1.handleDuoHuntCancel);
    interactions_1.componentRegistry.registerButtonPattern(/^duo_hunt_shoot_.+$/, huntHandlers_1.handleDuoHuntShoot);
    interactions_1.componentRegistry.registerButtonPattern(/^duo_hunt_skin_.+$/, huntHandlers_1.handleDuoHuntSkin);
    interactions_1.componentRegistry.registerButtonPattern(/^duo_hunt_end_.+$/, huntHandlers_1.handleDuoHuntEnd);
    // Hunter Store handlers
    interactions_1.componentRegistry.registerButtonPattern(/^hunterstore_meat_.+$/, hunterStoreHandlers_1.handleHunterStoreMeat);
    interactions_1.componentRegistry.registerButtonPattern(/^hunterstore_pelt_.+$/, hunterStoreHandlers_1.handleHunterStorePelt);
    interactions_1.componentRegistry.registerButtonPattern(/^hunterstore_fish_.+$/, hunterStoreHandlers_1.handleHunterStoreFish);
    interactions_1.componentRegistry.registerButtonPattern(/^hunterstore_special_.+$/, hunterStoreHandlers_1.handleHunterStoreSpecial);
    interactions_1.componentRegistry.registerButtonPattern(/^hunterstore_supply_.+$/, hunterStoreHandlers_1.handleHunterStoreSupply);
    interactions_1.componentRegistry.registerButtonPattern(/^hunterstore_buy_basic_bait_.+$/, hunterStoreHandlers_1.handleHunterStoreBuyBasicBait);
    interactions_1.componentRegistry.registerButtonPattern(/^hunterstore_buy_premium_bait_.+$/, hunterStoreHandlers_1.handleHunterStoreBuyPremiumBait);
    interactions_1.componentRegistry.registerButtonPattern(/^hunterstore_back_.+$/, hunterStoreHandlers_1.handleHunterStoreBack);
    interactions_1.componentRegistry.registerButtonPattern(/^hunterstore_confirm_.+$/, hunterStoreHandlers_1.handleHunterStoreConfirm);
    // Hunter Store select menus
    interactions_1.componentRegistry.registerSelectMenuPattern(/^hunterstore_menu_.+$/, hunterStoreMenus_1.handleHunterStoreMenu);
    interactions_1.componentRegistry.registerSelectMenuPattern(/^hunterstore_sell_.+$/, hunterStoreMenus_1.handleHunterStoreSell);
    interactions_1.componentRegistry.registerSelectMenuPattern(/^hunterstore_buy_.+$/, hunterStoreMenus_1.handleHunterStoreBuy);
    // Evento handlers (classification and prizes buttons)
    interactions_1.componentRegistry.registerButton('evento_mining_classification', eventoHandlers_1.handleMiningClassification);
    interactions_1.componentRegistry.registerButton('evento_mining_prizes', eventoHandlers_1.handleMiningPrizes);
    interactions_1.componentRegistry.registerButton('evento_hunting_classification', eventoHandlers_1.handleHuntingClassification);
    interactions_1.componentRegistry.registerButton('evento_hunting_prizes', eventoHandlers_1.handleHuntingPrizes);
    // Evento select menu
    interactions_1.componentRegistry.registerSelectMenu('evento_select_menu', eventoMenus_1.handleEventoSelectMenu);
    // Fishing button handlers
    interactions_1.componentRegistry.registerButtonPattern(/^fish_left_.+$/, fishingHandlers_1.handleFishLeft);
    interactions_1.componentRegistry.registerButtonPattern(/^fish_right_.+$/, fishingHandlers_1.handleFishRight);
    interactions_1.componentRegistry.registerButtonPattern(/^fish_catch_.+$/, fishingHandlers_1.handleFishCatch);
    // 🔜 TODO: Extract and register remaining handlers:
    // Guild handlers
    // componentRegistry.registerButton(/^guild_approve_/, handleGuildApprove);
    // componentRegistry.registerButton(/^guild_reject_/, handleGuildReject);
    // Shop/Carousel handlers
    // componentRegistry.registerButton('shop_backgrounds', handleShopBackgrounds);
    // componentRegistry.registerButton('shop_frames', handleShopFrames);
    // componentRegistry.registerButton(/^carousel_/, handleCarousel);
    // componentRegistry.registerButton(/^frame_carousel_/, handleFrameCarousel);
    // Select menus
    // componentRegistry.registerSelectMenu('help_category_select', handleHelpCategory);
    // componentRegistry.registerSelectMenu('select_background', handleSelectBackground);
    const buttonCount = interactions_1.componentRegistry.getRegisteredButtons().length;
    const menuCount = interactions_1.componentRegistry.getRegisteredSelectMenus().length;
    if (buttonCount > 0 || menuCount > 0) {
        console.log(`✅ Component handlers registered: ${buttonCount} buttons, ${menuCount} select menus`);
    }
    else {
        console.log('📝 ComponentRegistry ready (no handlers registered yet - migration in progress)');
    }
}
//# sourceMappingURL=registerHandlers.js.map