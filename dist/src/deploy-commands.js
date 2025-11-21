"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const discord_js_1 = require("discord.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const commands = [];
const commandsPath = path_1.default.join(__dirname, "commands");
const commandCategories = fs_1.default.readdirSync(commandsPath).filter((item) => {
    const itemPath = path_1.default.join(commandsPath, item);
    return fs_1.default.statSync(itemPath).isDirectory();
});
console.log(`🔍 Loading commands from ${commandCategories.length} categories...`);
const startTime = Date.now();
for (const category of commandCategories) {
    const categoryPath = path_1.default.join(commandsPath, category);
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
                commands.push(command.data.toJSON());
            }
            else {
                console.log(`⚠️  Command in ${file} is missing "data" or "execute"`);
            }
        }
        catch (error) {
            console.error(`❌ Error loading ${file}:`, error.message);
        }
    }
}
const loadTime = Date.now() - startTime;
console.log(`✅ Loaded ${commands.length} commands in ${loadTime}ms`);
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID;
if (!token || !clientId) {
    console.error("❌ ERROR: DISCORD_TOKEN or DISCORD_CLIENT_ID not configured in environment variables");
    process.exit(1);
}
const rest = new discord_js_1.REST().setToken(token);
(async () => {
    try {
        console.log(`🔄 Registering ${commands.length} slash commands...`);
        const data = (await rest.put(discord_js_1.Routes.applicationCommands(clientId), {
            body: commands,
        }));
        console.log(`✅ ${data.length} commands registered successfully!`);
    }
    catch (error) {
        console.error("❌ Error registering commands:");
        console.error(error);
    }
})();
//# sourceMappingURL=deploy-commands.js.map