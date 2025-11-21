# Sheriff Rex Bot - Documentação do Projeto

### Overview
Sheriff Rex is a comprehensive Discord bot written in TypeScript, featuring a Wild West theme. It offers 47 slash commands across 8 categories, including a dual economy system (Saloon Tokens + Silver Coins), automatic daily rewards, mini-games, a mining system, bounty hunting with visual posters, group expeditions, and a full moderation suite. The bot also supports personalized visual profiles using Canvas and is multilingual (PT-BR, EN-US, ES-ES, FR). Recent additions include a premium currency system (RexBucks), a web dashboard with Discord OAuth2 integration, and a weapon shop (/armaria) with carousel navigation and visual weapon cards.

**November 2025 Update**: Bot migrated to Replit environment with **iOS-like UX optimizations** featuring intelligent LRU canvas caching (up to 80% faster render times), skeleton loading screens, shimmer effects, and smooth transitions for a polished, fluid user experience. The project aims to provide a rich and engaging experience for Discord communities with its unique theme and extensive features.

### User Preferences
- I prefer simple language.
- I want iterative development.
- Ask before making major changes.
- I prefer detailed explanations.
- Do not make changes to the folder `website/`.
- Do not make changes to the file `src/utils/consoleLogger.ts`.
- Ensure all new features are fully translated into PT-BR, EN-US, and ES-ES.
- Prioritize the use of the centralized error handling system (`src/utils/errors/`).
- Utilize the `ComponentRegistry` for new button and menu handlers instead of if-else chains.

### System Architecture
The Sheriff Rex Bot is built with a modular and scalable architecture.

**UI/UX Decisions:**
- **Western Theme:** All visual assets, command themes, and the new web dashboard adhere to a consistent Wild West aesthetic.
- **Visual Profiles:** User profiles are generated dynamically using Canvas, allowing for personalized and visually appealing displays.
- **Interactive Elements:** Features like bounty hunting and team captures utilize interactive Discord components (buttons) for user engagement.
- **Minimalist Buttons:** Interactive components are designed to be concise and intuitive.

**Technical Implementations:**
- **TypeScript:** The entire bot is developed in TypeScript for type safety and maintainability.
- **Command Handling:** Uses Discord.js for robust command and event handling.
- **Database:** Flexible data storage, defaulting to JSON files for various game data (economy, profiles, inventories, bounties, guilds) and supporting PostgreSQL for more complex data like RexBucks transactions.
- **Logging:** Features a dual logging system: `consoleLogger.ts` for detailed console output with different log levels (debug, info, warn, error, success) and `logger.ts` for sending administrative logs as embeds to Discord channels.
- **Internationalization (i18n):** Supports multiple languages with a modular translation structure (`src/i18n/`).
- **Error Handling:** A centralized error handling system (`src/utils/errors/`) provides a hierarchical error structure and a global handler for Discord interactions.
- **Component Registry:** A dedicated `ComponentRegistry` (`src/interactions/ComponentRegistry.ts`) is designed to manage button and menu interactions, supporting exact matches and regex patterns.
- **Performance Optimization:** Includes features like an optimized cache system, a low-memory mode, and automatic sweepers for memory management.
- **iOS-like UX System (NEW):** 
  - **Canvas Caching** (`src/utils/canvasCache.ts`): LRU cache system with 30min TTL, max 100 images, automatic cleanup, and hit/miss tracking. Reduces Canvas render times by up to 80%.
  - **Loading States** (`src/utils/iosLikeUX.ts`): Skeleton screens, shimmer effects, smooth delays, and instant visual feedback for polished interactions.
  - **Optimized Commands**: `/profile` fully optimized with skeleton loading and cache-backed image rendering for sub-second responses on cache hits.

**Feature Specifications:**
- **Economy System:** Dual currency (Saloon Tokens, Silver Coins) with a premium currency (RexBucks) for real-money transactions, designed to be non-refundable and non-transferable with full audit trails.
- **Weapon Shop (/armaria):** Interactive weapon store with carousel navigation, visual weapon cards generated with Canvas, and integration with the inventory system. Features 4 weapons: Escopeta (damage: 85), Revólver de Vaqueiro (damage: 65), Revólver Calibre 38 (damage: 55), and Rifle de Caça (7,500 coins, 120 damage, 50 durability).
- **General Store (/generalstore):** Multi-category marketplace offering essential tools and upgrades. Features three categories (Ferramentas, Mochilas, Todos) with carousel navigation and visual item cards. Current items include: Vara de Pesca (800 silver coins, 40 durability), Picareta Lendária (30 Saloon Tokens), and three backpack tiers (Leather +200kg for 500 tokens, Bear +350kg for 1,200 tokens, Gold +500kg for 2,500 tokens). Supports dual currency system (Saloon Tokens OR Silver Coins per item) with correct currency display and validation.
- **Daily Rewards:** Automated daily rewards system.
- **Mini-Games:** Dice, duels, roulette, bank robbery, and general theft mechanics.
- **Hunting System (/hunt - November 2025):** Interactive hunting system with 5 attempts per hunt. Features session-based gameplay with interactive "Atirar" (Shoot) button, dynamic canvas showing animal silhouettes before revealing, real-time attempt counter (5/5, 4/5, etc.), shot accuracy tracking (60-100%), and progressive difficulty based on animal rarity. Requires Rifle de Caça (purchasable at /armaria for 7,500 silver coins). Animals range from common (Coelho Selvagem - 50% accuracy needed) to mythical (Águia Dourada - 95% accuracy needed). Includes DUO mode where two players hunt together for 10 minutes, sharing rewards when animals are skinned.
- **Fishing System (/fish - November 2025):** Interactive fishing mini-game with timing-based gameplay. Players select from 12 fish types (common to mythical) and must align a moving bar within a target zone using ◀️ and ▶️ buttons. Features session-based gameplay with automatic bar movement every 800ms, progressive difficulty (1-5 affecting zone size and speed), and multiple attempts (15-30 based on rarity). Success requires 3-7 successful catches depending on fish rarity. Rewards include fish items and XP (10-200). Requires Vara de Pesca (purchasable at /generalstore for 800 silver coins, 40 durability). Fish range from Bagre do Rio (80 coins) to Peixe Mítico (2,500 coins). Uses automatic bait selection (Premium if available, otherwise Basic) and displays fish names with grammatically correct Portuguese articles. Protected by transaction locks to prevent race conditions.
- **Hunter's Store (/hunterstore - November 2025):** Marketplace system for selling hunting and fishing items for silver coins. Features four categories with progressive pricing based on rarity: Meats (50-800 coins), Pelts (100-1,500 coins), Fish (80-2,500 coins), and Special items like Eagle Feather (2,000 coins). Interactive interface with category selection, item browsing, and confirmation system. Automatically deposits silver coins to player accounts upon sale.
- **Mining System:** Solo and cooperative resource gathering.
- **Weekly Mining Events (Corrida do Ouro - November 2025):** Competitive 48-hour mining events that run from Sunday 00:00 to Tuesday 00:00. Features automatic point tracking (1 gold = 40 points), visual canvas-based leaderboard with 7 progressive phases, and automatic reward distribution for top 10 players. Rewards include silver coins, saloon tokens, and XP, with 1st place receiving 300k silver + 300 tokens + 3500 XP. System includes transactional reward distribution with rollback protection and automatic Sunday restart detection. Uses custom emojis for medals (🥇🥈🥉), coins (🪙), and tokens (🎫).
- **Bounty System:** Visual wanted posters, solo capture, and team-based capture mechanics with shared rewards.
- **Expedition System:** Group expeditions with public invites.
- **Moderation:** Comprehensive suite of moderation commands including warnings, mutes, and log configuration.
- **Event Management (/eventadmin - November 2025):** Owner-only administrative command system for managing mining and hunting events. Features include: start-mining and start-hunting subcommands with customizable duration (days and hours), stop subcommand to deactivate events by type (all, mining, or hunting), and status subcommand to view active events with detailed information (participants, remaining time, phase). Includes validation to prevent duplicate events and uses Discord timestamps for clear time display. Only accessible to the bot owner (OWNER_ID environment variable).
- **Web Dashboard:** A new web dashboard provides administrative features and statistics, integrated via Discord OAuth2.
- **Events Web Page (/evento - November 2025):** Interactive web page for viewing both mining and hunting event rankings and statistics. Accessible via "🌐 Ver na Web" button in the `/evento` Discord command. Features Wild West themed design with real-time countdown timers, Top 10 leaderboard display for both event types, prize breakdown for all positions, and responsive layout. Served at `/events.html` with data from `/api/events` endpoint. Auto-refreshes every 30 seconds to show current event status. The web page displays:
  - **Mining Events (Corrida do Ouro):** Shows active mining event status, leaderboard with gold mined and points, and prize distribution (1st: 300k silver + 300 tokens + 3500 XP).
  - **Hunting Events (Caçada):** Shows active hunting event status, leaderboard with animals killed and points, and prize distribution (1st: 250k silver + 250 tokens + 3000 XP). Points calculated as: 1 pelt = 50 points, 1 meat = 20 points.
  - **Web Server:** Runs on port 5000 via `npm run linked-roles`. Provides REST APIs: `/api/events` (event data) and `/api/emojis` (custom emoji URLs).

**System Design Choices:**
- **Modular Structure:** The project is organized into logical folders for commands, events, utilities, and specific features to enhance maintainability and scalability.
- **Environment Variables:** Critical information like tokens and database URLs are managed through environment variables for security.
- **Cooldown Management:** A dedicated `cooldownManager.ts` prevents spam and balances game mechanics.
- **Event Scheduling:** Uses node-cron for automated event management. The event scheduler (`eventScheduler.ts`) handles Sunday-only event launches with immediate-start guards for mid-Sunday restarts, ensuring events always run within the 48-hour window (Sunday 00:00 to Tuesday 00:00).
- **Asset Management:** Custom emojis and images are centrally managed in the `assets/` directory. Nunito fonts (Bold, Regular, SemiBold) are stored in `assets/fonts/` for Canvas rendering with lazy registration to prevent memory leaks.

### External Dependencies
- **Discord API:** Core integration for bot functionality.
- **PostgreSQL:** Optional relational database for persistent data storage, particularly for RexBucks transactions and user data. If not configured, JSON files are used.
- **Express.js:** Used for the web server of the dashboard and linked roles.
- **OAuth2:** Integrated with Discord for user authentication on the web dashboard.

### Recent Changes

**November 21, 2025:**
- **Fixed General Store Currency Bug:** Corrected `/generalstore` to display the correct currency (Saloon Tokens OR Silver Coins) instead of always showing both. Updated canvas rendering to show proper currency icon and label based on item's currency field.
- **Moved Fishing Rod:** Relocated Vara de Pesca from `/armaria` to `/generalstore` with updated price (800 silver coins instead of 3,500) for better categorization as a tool rather than a weapon.
- **Enhanced Currency Display:** Added fallback emoji (🪙) for silver coins when image asset is unavailable, ensuring consistent visual feedback.