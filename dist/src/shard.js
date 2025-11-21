"use strict";
/**
 * Sharding Manager for scaling to 10,000+ users
 * Automatically spawns multiple shards based on guild count
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastEval = broadcastEval;
exports.getTotalStats = getTotalStats;
// Load environment variables (works both locally with .env and in production with system env)
const dotenv_1 = __importDefault(require("dotenv"));
const discord_js_1 = require("discord.js");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Try to load .env file if it exists (for local development)
const envPath = path_1.default.join(process.cwd(), ".env");
if (fs_1.default.existsSync(envPath)) {
    console.log("📄 Loading .env file...");
    dotenv_1.default.config({ path: envPath });
}
else {
    console.log("📦 Using system environment variables (production mode)");
}
// Debug: Log which variables are present (without exposing values)
console.log("🔍 Environment check:");
console.log("  - DISCORD_TOKEN:", process.env.DISCORD_TOKEN ? "✅ Present" : "❌ Missing");
console.log("  - DISCORD_CLIENT_ID:", process.env.DISCORD_CLIENT_ID ? "✅ Present" : "❌ Missing");
console.log("  - CLIENT_ID:", process.env.CLIENT_ID ? "✅ Present" : "❌ Missing");
// Import validation from security utils (compiled version)
const { validateEnvironment, getSafeEnvironmentInfo, } = require("./utils/security");
// Validate environment before starting
console.log("🔐 Validating environment variables...");
try {
    validateEnvironment();
    console.log("📊 Environment info:", getSafeEnvironmentInfo());
}
catch (error) {
    console.error("❌ Environment validation failed:", error);
    process.exit(1);
}
const token = process.env.DISCORD_TOKEN;
// Calculate optimal shard count
// Discord recommends 1 shard per 1000 guilds
// For 10k+ users, we'll use auto sharding
// Check if we're running with ts-node (development) or compiled (production)
const isTypeScript = __filename.endsWith(".ts");
const indexFile = isTypeScript
    ? path_1.default.join(__dirname, "index.ts")
    : path_1.default.join(__dirname, "index.js");
const shardOptions = {
    token: token,
    totalShards: "auto", // Auto-calculate based on guild count
    respawn: true, // Auto-respawn crashed shards
    shardArgs: process.argv.slice(2),
    execArgv: [
        "--max-old-space-size=512", // 512MB per shard
        "--expose-gc", // Enable manual garbage collection
    ],
};
// If running with TypeScript, use ts-node
if (isTypeScript) {
    shardOptions.execArgv.push("-r", "ts-node/register");
}
const manager = new discord_js_1.ShardingManager(indexFile, shardOptions);
// Shard lifecycle events
manager.on("shardCreate", (shard) => {
    console.log(`🚀 Launched shard ${shard.id}`);
    shard.on("ready", () => {
        console.log(`✅ Shard ${shard.id} is ready`);
    });
    shard.on("disconnect", () => {
        console.warn(`⚠️  Shard ${shard.id} disconnected`);
    });
    shard.on("reconnecting", () => {
        console.log(`🔄 Shard ${shard.id} reconnecting...`);
    });
    shard.on("death", () => {
        console.error(`❌ Shard ${shard.id} died`);
    });
    shard.on("error", (error) => {
        console.error(`❌ Shard ${shard.id} error:`, error);
    });
});
// Spawn all shards
console.log("🚀 Starting Sheriff Bot with sharding...");
console.log("⚡ Calculating optimal shard count...");
manager
    .spawn({ timeout: 60000 })
    .then((shards) => {
    console.log(`✅ Successfully spawned ${shards.size} shard(s)`);
    console.log("🤠 Sheriff Bot is running in production mode!");
})
    .catch((error) => {
    console.error("❌ Failed to spawn shards:", error);
    process.exit(1);
});
// Graceful shutdown
process.on("SIGTERM", async () => {
    console.log("\n🛑 Received SIGTERM, shutting down all shards...");
    await manager.broadcastEval("process.exit(0)");
});
process.on("SIGINT", async () => {
    console.log("\n🛑 Received SIGINT, shutting down all shards...");
    await manager.broadcastEval("process.exit(0)");
});
// Broadcast commands to all shards
async function broadcastEval(script) {
    return manager.broadcastEval(script);
}
// Get total stats across all shards
async function getTotalStats() {
    const results = await manager.broadcastEval(`({
    guilds: this.guilds.cache.size,
    users: this.users.cache.size,
    channels: this.channels.cache.size,
    memory: process.memoryUsage().heapUsed
  })`);
    return results.reduce((acc, curr) => ({
        guilds: acc.guilds + curr.guilds,
        users: acc.users + curr.users,
        channels: acc.channels + curr.channels,
        memory: acc.memory + curr.memory,
    }), { guilds: 0, users: 0, channels: 0, memory: 0 });
}
//# sourceMappingURL=shard.js.map