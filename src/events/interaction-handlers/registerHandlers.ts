import { componentRegistry } from '../../interactions';
import {
  handleProfileShowPublic,
  handleEditBio,
  handleEditPhrase,
  handleChangeBackground,
  handleChangeColors,
} from './buttons/profileHandlers';
import {
  handleShopBackgrounds,
  handleShopFrames,
  handleChangeFrame,
  handleCarouselNavigation,
  handleFrameCarouselNavigation,
  handleBuyFrame,
  handleBuyBackground,
} from './buttons/shopHandlers';
import { handleSelectColorTheme } from './selectMenus/profileMenus';
import { handleTeamCaptureButtons } from './buttons/teamCaptureHandlers';
import { handleViewPrizes, handleViewRanking } from './buttons/eventHandlers';
import {
  handleGeneralStoreNavigation,
  handleGeneralStorePurchase,
  handleGeneralStoreCategory,
} from './buttons/generalStoreHandlers';
import { 
  handleHuntShootButton,
  handleHuntModeSolo,
  handleHuntModeDuo,
  handleDuoHuntAccept,
  handleDuoHuntCancel,
  handleDuoHuntShoot,
  handleDuoHuntSkin,
  handleDuoHuntEnd,
} from './buttons/huntHandlers';
import {
  handleHunterStoreMeat,
  handleHunterStorePelt,
  handleHunterStoreFish,
  handleHunterStoreSpecial,
  handleHunterStoreBack,
  handleHunterStoreConfirm,
  handleHunterStoreSupply,
  handleHunterStoreBuyBasicBait,
  handleHunterStoreBuyPremiumBait,
} from './buttons/hunterStoreHandlers';
import { handleHunterStoreMenu, handleHunterStoreSell, handleHunterStoreBuy } from './selectMenus/hunterStoreMenus';
import {
  handleFishLeft,
  handleFishRight,
  handleFishCatch,
} from './buttons/fishingHandlers';
import {
  handleMiningClassification,
  handleMiningPrizes,
  handleHuntingClassification,
  handleHuntingPrizes,
} from './buttons/eventoHandlers';
import { handleEventoSelectMenu } from './selectMenus/eventoMenus';

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
export function registerAllHandlers(): void {
  // ✅ MIGRATED HANDLERS (tested and working)
  
  // Profile buttons
  componentRegistry.registerButton('profile_show_public', handleProfileShowPublic);
  componentRegistry.registerButton('edit_bio', handleEditBio);
  componentRegistry.registerButton('edit_phrase', handleEditPhrase);
  componentRegistry.registerButton('change_background', handleChangeBackground);
  componentRegistry.registerButton('change_colors', handleChangeColors);

  // Shop entry buttons
  componentRegistry.registerButton('shop_backgrounds', handleShopBackgrounds);
  componentRegistry.registerButton('shop_frames', handleShopFrames);
  componentRegistry.registerButton('change_frame', handleChangeFrame);

  // Profile select menus
  componentRegistry.registerSelectMenu('select_color_theme', handleSelectColorTheme);

  // Carousel navigation patterns
  componentRegistry.registerButtonPattern(/^carousel_(next|prev)_\d+$/, handleCarouselNavigation);
  componentRegistry.registerButtonPattern(/^frame_carousel_(next|prev)_\d+$/, handleFrameCarouselNavigation);

  // Purchase patterns
  componentRegistry.registerButtonPattern(/^buy_frame_.+_\d+$/, handleBuyFrame);
  componentRegistry.registerButtonPattern(/^buy_bg_.+_\d+$/, handleBuyBackground);
  
  // Team capture buttons
  componentRegistry.registerButtonPattern(/^team_(join|leave|start|cancel)_.+$/, handleTeamCaptureButtons);
  
  // Event buttons
  componentRegistry.registerButton('view_prizes', handleViewPrizes);
  componentRegistry.registerButton('view_ranking', handleViewRanking);
  
  // General Store handlers
  componentRegistry.registerButtonPattern(/^gstore_(next|prev)_\d+_.+$/, handleGeneralStoreNavigation);
  componentRegistry.registerButtonPattern(/^gstore_buy_.+_\d+_.+$/, handleGeneralStorePurchase);
  componentRegistry.registerButtonPattern(/^gstore_cat_.+_\d+$/, handleGeneralStoreCategory);
  
  // Hunt button handlers
  componentRegistry.registerButtonPattern(/^hunt_mode_solo_.+$/, handleHuntModeSolo);
  componentRegistry.registerButtonPattern(/^hunt_mode_duo_.+$/, handleHuntModeDuo);
  componentRegistry.registerButtonPattern(/^hunt_shoot_.+$/, handleHuntShootButton);
  
  // Duo Hunt button handlers
  componentRegistry.registerButtonPattern(/^duo_hunt_accept_.+$/, handleDuoHuntAccept);
  componentRegistry.registerButtonPattern(/^duo_hunt_cancel_.+$/, handleDuoHuntCancel);
  componentRegistry.registerButtonPattern(/^duo_hunt_shoot_.+$/, handleDuoHuntShoot);
  componentRegistry.registerButtonPattern(/^duo_hunt_skin_.+$/, handleDuoHuntSkin);
  componentRegistry.registerButtonPattern(/^duo_hunt_end_.+$/, handleDuoHuntEnd);
  
  // Hunter Store handlers
  componentRegistry.registerButtonPattern(/^hunterstore_buy_basic_bait_.+$/, handleHunterStoreBuyBasicBait);
  componentRegistry.registerButtonPattern(/^hunterstore_buy_premium_bait_.+$/, handleHunterStoreBuyPremiumBait);
  componentRegistry.registerButtonPattern(/^hunterstore_back_.+$/, handleHunterStoreBack);
  componentRegistry.registerButtonPattern(/^hunterstore_confirm_.+$/, handleHunterStoreConfirm);
  
  // Hunter Store select menus
  componentRegistry.registerSelectMenuPattern(/^hunterstore_menu_.+$/, handleHunterStoreMenu);
  componentRegistry.registerSelectMenuPattern(/^hunterstore_sell_.+$/, handleHunterStoreSell);
  componentRegistry.registerSelectMenuPattern(/^hunterstore_buy_.+$/, handleHunterStoreBuy);
  
  // Evento handlers (classification and prizes buttons)
  componentRegistry.registerButton('evento_mining_classification', handleMiningClassification);
  componentRegistry.registerButton('evento_mining_prizes', handleMiningPrizes);
  componentRegistry.registerButton('evento_hunting_classification', handleHuntingClassification);
  componentRegistry.registerButton('evento_hunting_prizes', handleHuntingPrizes);
  
  // Evento select menu
  componentRegistry.registerSelectMenu('evento_select_menu', handleEventoSelectMenu);
  
  // Fishing button handlers
  componentRegistry.registerButtonPattern(/^fish_left_.+$/, handleFishLeft);
  componentRegistry.registerButtonPattern(/^fish_right_.+$/, handleFishRight);
  componentRegistry.registerButtonPattern(/^fish_catch_.+$/, handleFishCatch);
  
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

  const buttonCount = componentRegistry.getRegisteredButtons().length;
  const menuCount = componentRegistry.getRegisteredSelectMenus().length;
  
  if (buttonCount > 0 || menuCount > 0) {
    console.log(
      `✅ Component handlers registered: ${buttonCount} buttons, ${menuCount} select menus`,
    );
  } else {
    console.log(
      '📝 ComponentRegistry ready (no handlers registered yet - migration in progress)',
    );
  }
}
