"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables (works both locally with .env and in production with system env)
const dotenv_1 = __importDefault(require("dotenv"));
const discord_js_1 = require("discord.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("./utils/logger"));
const consoleLogger_1 = __importDefault(require("./utils/consoleLogger"));
const security_1 = require("./utils/security");
const errorHandler_1 = require("./utils/errorHandler");
const cooldownManager_1 = require("./utils/cooldownManager");
const performance_1 = require("./utils/performance");
const territoryIncome_1 = require("./utils/territoryIncome");
const miningTracker_1 = require("./utils/miningTracker");
const expeditionChecker_1 = require("./utils/expeditionChecker");
const warehouseManager_1 = require("./utils/warehouseManager");
const dailyRewards_1 = require("./utils/dailyRewards");
const eventScheduler_1 = require("./utils/eventScheduler");
const xpManager_1 = require("./utils/xpManager");
const database_1 = require("./utils/database");
const punishmentManager_1 = require("./utils/punishmentManager");
const messageThrottler_1 = require("./utils/messageThrottler");
// Display startup banner
consoleLogger_1.default.startup("Initializing Sheriff Rex Bot");
// Try to load .env file if it exists (for local development)
const envPath = path_1.default.join(process.cwd(), ".env");
if (fs_1.default.existsSync(envPath)) {
    consoleLogger_1.default.info("Loading .env file");
    dotenv_1.default.config({ path: envPath });
}
else {
    consoleLogger_1.default.info("Using system environment variables (production mode)");
}
// Check environment variables
consoleLogger_1.default.section("Environment Check");
consoleLogger_1.default.table({
    "DISCORD_TOKEN": !!process.env.DISCORD_TOKEN,
    "DISCORD_CLIENT_ID": !!process.env.DISCORD_CLIENT_ID,
    "CLIENT_ID": !!process.env.CLIENT_ID,
    "DATABASE_URL": !!process.env.DATABASE_URL,
    "NODE_ENV": process.env.NODE_ENV || "development",
});
// Validate environment variables before starting
consoleLogger_1.default.info("Validating environment variables");
try {
    (0, security_1.validateEnvironment)();
    consoleLogger_1.default.success("Environment validation passed");
    consoleLogger_1.default.debug("Environment info: " + JSON.stringify((0, security_1.getSafeEnvironmentInfo)()));
}
catch (error) {
    consoleLogger_1.default.error("Environment validation failed", (0, security_1.sanitizeErrorForLogging)(error));
    process.exit(1);
}
// Production mode - reduce console logs
const isProduction = process.env.NODE_ENV === "production";
consoleLogger_1.default.section("Database Initialization");
consoleLogger_1.default.info("Initializing database system");
(0, database_1.initializeDatabase)();
consoleLogger_1.default.success("Database system ready");
// Detect low memory environment
const isLowMemory = process.env.LOW_MEMORY === "true" ||
    (process.env.MEMORY_LIMIT && parseInt(process.env.MEMORY_LIMIT) < 100);
consoleLogger_1.default.info(`Memory mode: ${isLowMemory ? "LOW MEMORY" : "PRODUCTION"}`);
// Production-optimized client configuration
const client = new discord_js_1.Client({
    // Optimized intents - only what's needed
    intents: performance_1.PRODUCTION_INTENTS,
    // Minimal partials for better performance
    partials: [discord_js_1.Partials.User, discord_js_1.Partials.Channel, discord_js_1.Partials.GuildMember],
    // Advanced cache configuration - auto-detect based on memory
    makeCache: isLowMemory ? performance_1.LOW_MEMORY_CACHE_CONFIG : performance_1.PRODUCTION_CACHE_CONFIG,
    // Aggressive sweepers for memory management
    sweepers: performance_1.PRODUCTION_SWEEPERS,
    // Connection settings for stability
    rest: {
        timeout: 15000,
        retries: 3,
    },
    // Presence configuration
    presence: {
        status: "online",
        activities: [
            {
                name: "Sheriff Rex | /help",
                type: 0, // Playing
            },
        ],
    },
    // Fail if cache is full (prevents memory leaks)
    failIfNotExists: false,
    // Allow mentions
    allowedMentions: {
        parse: ["users", "roles"],
        repliedUser: true,
    },
});
client.commands = new discord_js_1.Collection();
// Helper function to load commands from a directory
function loadCommandsFromPath(basePath, pathLabel) {
    if (!fs_1.default.existsSync(basePath)) {
        consoleLogger_1.default.debug(`Path ${pathLabel} does not exist, skipping`);
        return 0;
    }
    const categories = fs_1.default.readdirSync(basePath).filter((item) => {
        const itemPath = path_1.default.join(basePath, item);
        return fs_1.default.statSync(itemPath).isDirectory();
    });
    let count = 0;
    for (const category of categories) {
        const categoryPath = path_1.default.join(basePath, category);
        const commandFiles = fs_1.default
            .readdirSync(categoryPath)
            .filter((file) => (file.endsWith(".js") || file.endsWith(".ts")) &&
            !file.endsWith(".d.ts"));
        for (const file of commandFiles) {
            const filePath = path_1.default.join(categoryPath, file);
            try {
                const importedCommand = require(filePath);
                // Support both export default and named exports
                const command = importedCommand.default || importedCommand;
                if ("data" in command && "execute" in command) {
                    client.commands.set(command.data.name, command);
                    count++;
                    consoleLogger_1.default.debug(`Loaded command: /${command.data.name} (${pathLabel}/${category})`);
                }
            }
            catch (error) {
                consoleLogger_1.default.error(`Failed to load command ${file}`, (0, security_1.sanitizeErrorForLogging)(error));
            }
        }
    }
    return count;
}
consoleLogger_1.default.section("Loading Commands");
let commandCount = 0;
// Load from traditional commands directory
const commandsPath = path_1.default.join(__dirname, "commands");
commandCount += loadCommandsFromPath(commandsPath, "commands");
// Load from features directory
const featuresPath = path_1.default.join(__dirname, "features");
commandCount += loadCommandsFromPath(featuresPath, "features");
consoleLogger_1.default.success(`Loaded ${commandCount} total commands`);
consoleLogger_1.default.section("Loading Events");
const eventsPath = path_1.default.join(__dirname, "events");
const eventFiles = fs_1.default
    .readdirSync(eventsPath)
    .filter((file) => (file.endsWith(".js") || file.endsWith(".ts")) && !file.endsWith(".d.ts"));
let eventCount = 0;
for (const file of eventFiles) {
    const filePath = path_1.default.join(eventsPath, file);
    try {
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        }
        else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        eventCount++;
        consoleLogger_1.default.debug(`Loaded event: ${event.name}${event.once ? ' (once)' : ''}`);
    }
    catch (error) {
        consoleLogger_1.default.error(`Failed to load event ${file}`, (0, security_1.sanitizeErrorForLogging)(error));
    }
}
consoleLogger_1.default.success(`Loaded ${eventCount} events`);
/**
 * Ensures an interaction is deferred to prevent timeout errors
 * @param interaction - The interaction to defer
 * @param options - Optional defer configuration (ephemeral, etc.)
 * @returns true if deferred, false if already replied/deferred
 */
async function ensureDeferred(interaction, options) {
    if (interaction.deferred || interaction.replied) {
        return false;
    }
    try {
        await interaction.deferReply(options);
        return true;
    }
    catch (error) {
        return false;
    }
}
client.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    const command = client.commands.get(interaction.commandName);
    if (!command) {
        consoleLogger_1.default.warn(`Command ${interaction.commandName} not found`);
        return;
    }
    // Prevent double execution
    if (interaction._handled) {
        consoleLogger_1.default.debug(`Interaction already handled for ${interaction.commandName}`);
        return;
    }
    interaction._handled = true;
    // Detect and save user language automatically
    const { getLocale } = require("./utils/i18n");
    getLocale(interaction);
    // Performance monitoring - start timer
    const commandStartTime = Date.now();
    // Check cooldown using CooldownManager
    const cooldownAmount = command.cooldown ? command.cooldown * 1000 : 1000;
    const onCooldown = await cooldownManager_1.globalCooldownManager.handleCooldown(interaction, interaction.commandName, cooldownAmount);
    if (onCooldown) {
        return; // CooldownManager already replied to user
    }
    const allowedWhenPunished = [
        "help",
        "ping",
        "inventory",
        "profile",
        "avatar",
        "bounties",
    ];
    if (!allowedWhenPunished.includes(interaction.commandName)) {
        const punishment = (0, punishmentManager_1.isPunished)(interaction.user.id);
        if (punishment) {
            const remaining = (0, punishmentManager_1.getRemainingTime)(interaction.user.id) || 0;
            return interaction.reply({
                content: `🔒 **You're in jail!**\n\n${punishment.reason}\n\n⏰ Time remaining: **${(0, punishmentManager_1.formatTime)(remaining)}**\n\nYou cannot use this command while serving your sentence!\n\n✅ Allowed: /help, /ping, /inventory, /profile, /bounties`,
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
        }
    }
    // Auto-defer for commands with autoDefer metadata
    // This prevents "Unknown interaction" errors for commands that take >3 seconds
    if (command.autoDefer) {
        const deferOptions = command.autoDefer.ephemeral
            ? { ephemeral: true }
            : undefined;
        await ensureDeferred(interaction, deferOptions);
    }
    try {
        await command.execute(interaction);
        // Performance monitoring - measure command time
        (0, performance_1.measureCommandTime)(interaction.commandName, commandStartTime);
        if (interaction.guild) {
            const options = interaction.options.data
                .map((opt) => `${opt.name}: ${opt.value || opt.user?.id || opt.channel?.id || "N/A"}`)
                .join(", ");
            logger_1.default.log(client, interaction.guild.id, "command", {
                user: interaction.user,
                command: interaction.commandName,
                channelId: interaction.channel?.id || "DM",
                options: options || "None",
            });
        }
    }
    catch (error) {
        // Use centralized error handler
        await errorHandler_1.ErrorHandler.handleCommandError(error, interaction, interaction.commandName);
    }
});
client.on(discord_js_1.Events.MessageCreate, async (message) => {
    if (message.author.bot)
        return;
    // Throttled XP gain - only process once per minute per user to save memory
    if ((0, messageThrottler_1.canGainXp)(message.author.id)) {
        const xpAmount = Math.floor(Math.random() * 11) + 15; // 15-25 XP
        const xpResult = (0, xpManager_1.addXp)(message.author.id, xpAmount);
        if (xpResult.leveledUp) {
            consoleLogger_1.default.debug(`${message.author.tag} has leveled up to level ${xpResult.newLevel}!`);
        }
    }
    const prefix = "!";
    if (!message.content.startsWith(prefix))
        return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();
    // !ping - Latency check
    if (commandName === "ping") {
        const latency = Date.now() - message.createdTimestamp;
        await message.reply(`🏓 Pong! Latency: ${latency}ms | API: ${Math.round(client.ws.ping)}ms`);
        return;
    }
    // !help - Help menu
    if (commandName === "ajuda" || commandName === "help") {
        await message.reply({
            embeds: [
                {
                    title: "🤠 Sheriff Bot - Commands",
                    description: "**Prefix Commands:** Use `!` before these commands\n**Slash Commands:** Use `/` for full features\n\n**Most commands work better with `/` (Slash Commands)**",
                    color: 0xf4a460,
                    fields: [
                        {
                            name: "🔧 Basic Commands",
                            value: "`!ping` - Check latency\n`!help` - This menu\n`!invite` - Invite the bot\n`!info` - Bot information",
                            inline: false,
                        },
                        {
                            name: "💰 Economy",
                            value: "`!daily` - Daily reward\n`!profile` - Your profile\n`!inventory` - Your inventory\n`!leaderboard` - Top users",
                            inline: false,
                        },
                        {
                            name: "⭐ Recommended",
                            value: "Use `/help` for the complete command list with all features!",
                            inline: false,
                        },
                    ],
                    footer: {
                        text: "Sheriff Bot - Wild West Discord Bot",
                    },
                },
            ],
        });
        return;
    }
    // !invite - Bot invite link
    if (commandName === "invite" || commandName === "convite") {
        const clientId = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID;
        if (!clientId) {
            await message.reply("❌ Bot invite link not configured.");
            return;
        }
        await message.reply({
            embeds: [
                {
                    title: "🤠 Invite Sheriff Bot",
                    description: `Click the link below to add Sheriff Bot to your server!\n\n[**Add to Server**](https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands)`,
                    color: 0xf4a460,
                    footer: {
                        text: "Sheriff Bot - Bringing Wild West to Discord",
                    },
                },
            ],
        });
        return;
    }
    // !info - Bot information
    if (commandName === "info" || commandName === "about") {
        const uptime = client.uptime || 0;
        const days = Math.floor(uptime / 86400000);
        const hours = Math.floor(uptime / 3600000) % 24;
        const minutes = Math.floor(uptime / 60000) % 60;
        await message.reply({
            embeds: [
                {
                    title: "🤠 Sheriff Bot Information",
                    description: "Wild West themed Discord bot with economy, games, and more!",
                    color: 0xf4a460,
                    fields: [
                        {
                            name: "📊 Statistics",
                            value: `**Servers:** ${client.guilds.cache.size}\n**Users:** ${client.users.cache.size}\n**Commands:** 45`,
                            inline: true,
                        },
                        {
                            name: "⏰ Uptime",
                            value: `${days}d ${hours}h ${minutes}m`,
                            inline: true,
                        },
                        {
                            name: "🎮 Features",
                            value: "• Economy System\n• Mini Games\n• Mining System\n• Bounty System\n• Moderation Tools",
                            inline: false,
                        },
                    ],
                    footer: {
                        text: "Made with ❤️ by gomezfy",
                    },
                },
            ],
        });
        return;
    }
    // !daily - Daily reward (simplified)
    if (commandName === "daily" || commandName === "diario") {
        await message.reply({
            embeds: [
                {
                    title: "💰 Daily Reward",
                    description: "To claim your daily reward with streak bonuses and full features, use:\n\n`/daily`\n\nThe slash command includes:\n• Streak system\n• Bonus rewards\n• XP gains\n• Better interface",
                    color: 0xf4a460,
                    footer: {
                        text: "Tip: Use /daily for the full experience!",
                    },
                },
            ],
        });
        return;
    }
    // !profile - View profile
    if (commandName === "profile" || commandName === "perfil") {
        await message.reply({
            embeds: [
                {
                    title: "👤 Your Profile",
                    description: "To view your full profile with stats, badges, and custom background, use:\n\n`/profile`\n\nThe slash command includes:\n• Visual profile card\n• Statistics\n• Level & XP\n• Custom backgrounds",
                    color: 0xf4a460,
                    footer: {
                        text: "Tip: Use /profile for the visual card!",
                    },
                },
            ],
        });
        return;
    }
    // !inventory - View inventory
    if (commandName === "inventory" ||
        commandName === "inv" ||
        commandName === "inventario") {
        await message.reply({
            embeds: [
                {
                    title: "🎒 Your Inventory",
                    description: "To view your complete inventory with all items, use:\n\n`/inventory`\n\nThe slash command shows:\n• All your items\n• Item quantities\n• Item values\n• Better organization",
                    color: 0xf4a460,
                    footer: {
                        text: "Tip: Use /inventory for full details!",
                    },
                },
            ],
        });
        return;
    }
    // !leaderboard - Top users
    if (commandName === "leaderboard" ||
        commandName === "top" ||
        commandName === "rank") {
        await message.reply({
            embeds: [
                {
                    title: "🏆 Leaderboard",
                    description: "To see the full leaderboard with rankings, use:\n\n`/leaderboard`\n\nThe slash command includes:\n• Top 10 richest users\n• Total wealth\n• Rankings\n• Visual display",
                    color: 0xf4a460,
                    footer: {
                        text: "Tip: Use /leaderboard for the full rankings!",
                    },
                },
            ],
        });
        return;
    }
    // Unknown command
    await message.reply({
        content: `❌ Unknown command: \`!${commandName}\`\n\nTry \`!help\` to see available commands!`,
        allowedMentions: { repliedUser: false },
    });
});
process.on("unhandledRejection", (error) => {
    consoleLogger_1.default.error("[UNHANDLED REJECTION]", (0, security_1.sanitizeErrorForLogging)(error));
});
process.on("uncaughtException", (error) => {
    consoleLogger_1.default.error("[UNCAUGHT EXCEPTION]", (0, security_1.sanitizeErrorForLogging)(error));
    process.exit(1);
});
client.on("error", (error) => {
    consoleLogger_1.default.error("[CLIENT ERROR]", (0, security_1.sanitizeErrorForLogging)(error));
});
client.on("warn", (info) => {
    consoleLogger_1.default.warn(`[CLIENT WARNING] ${info}`);
});
client.on("shardError", (error) => {
    consoleLogger_1.default.error("[SHARD ERROR]", (0, security_1.sanitizeErrorForLogging)(error));
});
const token = process.env.DISCORD_TOKEN;
if (!token) {
    consoleLogger_1.default.error("Discord token not found!");
    consoleLogger_1.default.error("Configure the DISCORD_TOKEN environment variable");
    process.exit(1);
}
consoleLogger_1.default.info("Token found, attempting login...");
// Setup production optimizations
consoleLogger_1.default.section("Production Optimizations");
(0, performance_1.setupGracefulShutdown)(client);
(0, performance_1.setupMemoryOptimization)();
(0, performance_1.setupPerformanceMonitoring)(client);
// Health check endpoint (lazy-loaded only when needed)
if (process.env.ENABLE_HEALTH_CHECK === "true") {
    Promise.resolve().then(() => __importStar(require("express"))).then(({ default: express }) => {
        const app = express();
        app.get("/health", (req, res) => {
            const status = performance_1.healthCheck.getStatus();
            const metrics = performance_1.performanceMonitor.getMetrics();
            res.json({
                status: status.healthy ? "healthy" : "unhealthy",
                uptime: performance_1.performanceMonitor.getUptime(),
                memory: performance_1.performanceMonitor.getMemoryUsage(),
                guilds: client.guilds.cache.size,
                users: client.users.cache.size,
                metrics: metrics,
                errors: status.errors,
            });
        });
        const healthPort = process.env.HEALTH_PORT || 3001;
        app.listen(healthPort, () => {
            consoleLogger_1.default.success(`Health check endpoint running on port ${healthPort}`);
        });
    })
        .catch((err) => {
        consoleLogger_1.default.error("Failed to load health check server", (0, security_1.sanitizeErrorForLogging)(err));
    });
}
client
    .login(token)
    .then(() => {
    consoleLogger_1.default.section("Bot Systems");
    // Start automatic territory income system
    consoleLogger_1.default.info("Starting territory income system");
    (0, territoryIncome_1.startAutomaticTerritoryIncome)(client);
    // Start automatic mining notification system
    consoleLogger_1.default.info("Starting mining notification system");
    (0, miningTracker_1.startMiningNotifications)(client);
    // Start automatic expedition checker system
    consoleLogger_1.default.info("Starting expedition checker system");
    (0, expeditionChecker_1.startExpeditionChecker)(client);
    // Start warehouse statistics hourly reset
    consoleLogger_1.default.info("Starting warehouse stats reset");
    (0, warehouseManager_1.startWarehouseStatsReset)();
    // Start daily rewards scheduler
    consoleLogger_1.default.info("Starting daily rewards scheduler");
    (0, dailyRewards_1.startDailyRewardsScheduler)(client);
    // Start mining event scheduler
    consoleLogger_1.default.info("Starting mining event scheduler");
    (0, eventScheduler_1.startEventScheduler)(client).catch((error) => {
        consoleLogger_1.default.error("Failed to start event scheduler:", (0, security_1.sanitizeErrorForLogging)(error));
    });
    // Start automatic mute expiration checker
    consoleLogger_1.default.info("Starting mute expiration checker");
    const { checkExpiredMutes } = require("./utils/muteManager");
    setInterval(() => {
        const expiredKeys = checkExpiredMutes();
        if (expiredKeys.length > 0) {
            consoleLogger_1.default.debug(`${expiredKeys.length} mute(s) expired and removed`);
        }
    }, 60000); // Check every minute
    performance_1.healthCheck.markHealthy();
    consoleLogger_1.default.success("All systems operational!");
})
    .catch((error) => {
    const sanitizedError = (0, security_1.sanitizeErrorForLogging)(error);
    consoleLogger_1.default.error("Login failed", sanitizedError);
    performance_1.healthCheck.markUnhealthy(`Login failed: ${error.message}`);
    if (error.message.includes("token")) {
        consoleLogger_1.default.divider();
        consoleLogger_1.default.warn("TOKEN ERROR - Possible solutions:");
        consoleLogger_1.default.info("1. Verify the token is correct");
        consoleLogger_1.default.info("2. Generate a new token at: https://discord.com/developers/applications");
        consoleLogger_1.default.info("3. Configure DISCORD_TOKEN environment variable");
    }
    if (error.message.includes("intents")) {
        consoleLogger_1.default.divider();
        consoleLogger_1.default.warn("INTENTS ERROR - Possible solutions:");
        consoleLogger_1.default.info("1. Access: https://discord.com/developers/applications");
        consoleLogger_1.default.info("2. Go to Bot > Privileged Gateway Intents");
        consoleLogger_1.default.info("3. Enable all options (Presence, Server Members, Message Content)");
    }
    process.exit(1);
});
//# sourceMappingURL=index.js.map