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
export declare function registerAllHandlers(): void;
//# sourceMappingURL=registerHandlers.d.ts.map