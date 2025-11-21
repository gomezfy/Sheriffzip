"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEmojiMapping = loadEmojiMapping;
exports.saveEmojiMapping = saveEmojiMapping;
exports.uploadCustomEmojis = uploadCustomEmojis;
exports.syncServerEmojis = syncServerEmojis;
exports.getCustomEmoji = getCustomEmoji;
exports.listCustomEmojis = listCustomEmojis;
exports.removeCustomEmoji = removeCustomEmoji;
exports.removeAllCustomEmojis = removeAllCustomEmojis;
const database_1 = require("./database");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const EMOJI_MAPPING_FILE = path_1.default.join((0, database_1.getDataPath)("data"), "emoji-mapping.json");
const CUSTOM_EMOJIS_DIR = (0, database_1.getDataPath)("assets", "custom-emojis");
/**
 * Carrega o mapeamento de emojis do arquivo JSON
 */
function loadEmojiMapping() {
    if (!fs_1.default.existsSync(EMOJI_MAPPING_FILE)) {
        return {};
    }
    try {
        const data = fs_1.default.readFileSync(EMOJI_MAPPING_FILE, "utf-8");
        return JSON.parse(data);
    }
    catch (error) {
        console.error("Error loading emoji mapping:", error);
        return {};
    }
}
/**
 * Salva o mapeamento de emojis no arquivo JSON
 * @param mapping
 */
function saveEmojiMapping(mapping) {
    try {
        fs_1.default.writeFileSync(EMOJI_MAPPING_FILE, JSON.stringify(mapping, null, 2), "utf-8");
    }
    catch (error) {
        console.error("Error saving emoji mapping:", error);
    }
}
/**
 * Faz upload de todos os emojis da pasta custom-emojis para o servidor Discord
 * @param guild
 */
async function uploadCustomEmojis(guild) {
    const results = {
        success: 0,
        failed: 0,
        errors: [],
    };
    // Verifica se a pasta existe
    if (!fs_1.default.existsSync(CUSTOM_EMOJIS_DIR)) {
        results.errors.push("Custom emojis directory not found");
        return results;
    }
    // Função para ler arquivos recursivamente incluindo subpastas
    function getAllEmojiFiles(dir, baseDir = dir) {
        const files = [];
        const items = fs_1.default.readdirSync(dir);
        for (const item of items) {
            const fullPath = path_1.default.join(dir, item);
            const stat = fs_1.default.statSync(fullPath);
            if (stat.isDirectory()) {
                // Recursivamente procura em subpastas
                files.push(...getAllEmojiFiles(fullPath, baseDir));
            }
            else if (item.endsWith(".png") || item.endsWith(".gif")) {
                // Remove extensão e usa o nome do arquivo como nome do emoji
                const name = item.replace(/\.(png|gif)$/, "");
                files.push({ fullPath, name });
            }
        }
        return files;
    }
    // Lê todos os arquivos PNG/GIF da pasta e subpastas
    const files = getAllEmojiFiles(CUSTOM_EMOJIS_DIR);
    if (files.length === 0) {
        results.errors.push("No emoji files found in custom-emojis folder");
        return results;
    }
    // Fetch emojis to update cache
    try {
        await guild.emojis.fetch();
    }
    catch (error) {
        results.errors.push(`Failed to fetch server emojis: ${error.message}`);
    }
    const mapping = loadEmojiMapping();
    // Process uploads in parallel with limit to avoid rate limiting
    const uploadPromises = files.map(async (file) => {
        try {
            const filePath = file.fullPath;
            const emojiName = file.name;
            // Verifica o tamanho do arquivo (máximo 256KB)
            const stats = fs_1.default.statSync(filePath);
            if (stats.size > 256 * 1024) {
                return {
                    success: false,
                    name: emojiName,
                    error: `File too large (${Math.round(stats.size / 1024)}KB > 256KB)`,
                };
            }
            // Verifica se o emoji já existe no servidor (usando cache)
            const existingEmoji = guild.emojis.cache.find((e) => e.name === emojiName);
            if (existingEmoji) {
                // Atualiza o mapeamento com o emoji existente
                const prefix = existingEmoji.animated ? "a:" : ":";
                return {
                    success: true,
                    name: emojiName,
                    emojiString: `<${prefix}${existingEmoji.name}:${existingEmoji.id}>`,
                    wasExisting: true,
                };
            }
            // Faz upload do emoji para o servidor
            const emoji = await guild.emojis.create({
                attachment: filePath,
                name: emojiName,
                reason: "Custom emoji upload via Sheriff Rex Bot",
            });
            // Salva o mapeamento (usa sintaxe correta para animated)
            const prefix = emoji.animated ? "a:" : ":";
            return {
                success: true,
                name: emojiName,
                emojiString: `<${prefix}${emoji.name}:${emoji.id}>`,
                wasExisting: false,
            };
        }
        catch (error) {
            return {
                success: false,
                name: file.name,
                error: error.message,
            };
        }
    });
    // Wait for all uploads to complete
    const uploadResults = await Promise.allSettled(uploadPromises);
    // Process results
    for (const result of uploadResults) {
        if (result.status === "fulfilled") {
            const data = result.value;
            if (data.success && data.emojiString) {
                results.success++;
                mapping[data.name] = data.emojiString;
            }
            else {
                results.failed++;
                results.errors.push(`${data.name}: ${data.error || "Unknown error"}`);
            }
        }
        else {
            results.failed++;
            results.errors.push(`Unknown error: ${result.reason}`);
        }
    }
    // Salva o mapeamento atualizado
    saveEmojiMapping(mapping);
    return results;
}
/**
 * Sincroniza os emojis existentes do servidor com o mapeamento
 * Busca todos os emojis do servidor e atualiza o arquivo de mapeamento
 * @param guild
 */
async function syncServerEmojis(guild) {
    const results = {
        success: 0,
        failed: 0,
        errors: [],
    };
    try {
        const serverEmojis = await guild.emojis.fetch();
        if (serverEmojis.size === 0) {
            results.errors.push("No emojis found on server");
            return results;
        }
        const mapping = loadEmojiMapping();
        serverEmojis.forEach((emoji) => {
            if (emoji.name) {
                const prefix = emoji.animated ? "a:" : ":";
                mapping[emoji.name] = `<${prefix}${emoji.name}:${emoji.id}>`;
                results.success++;
            }
        });
        saveEmojiMapping(mapping);
    }
    catch (error) {
        results.errors.push(`Failed to sync emojis: ${error.message}`);
    }
    return results;
}
/**
 * Obtém um emoji customizado pelo nome
 * @param name
 * @param fallback
 */
function getCustomEmoji(name, fallback = "❓") {
    const mapping = loadEmojiMapping();
    return mapping[name] || fallback;
}
/**
 * Lista todos os emojis customizados disponíveis
 */
function listCustomEmojis() {
    const mapping = loadEmojiMapping();
    return Object.keys(mapping);
}
/**
 * Remove um emoji do servidor e do mapeamento
 * @param guild
 * @param emojiName
 */
async function removeCustomEmoji(guild, emojiName) {
    try {
        const mapping = loadEmojiMapping();
        const emojiString = mapping[emojiName];
        if (!emojiString) {
            return false;
        }
        // Extrai o ID do emoji
        const match = emojiString.match(/:(\d+)>/);
        if (!match) {
            return false;
        }
        const emojiId = match[1];
        const emoji = guild.emojis.cache.get(emojiId);
        if (emoji) {
            await emoji.delete("Removed via Sheriff Rex Bot");
        }
        // Remove do mapeamento
        delete mapping[emojiName];
        saveEmojiMapping(mapping);
        return true;
    }
    catch (error) {
        console.error("Error removing custom emoji:", error);
        return false;
    }
}
/**
 * Remove todos os emojis customizados do servidor Discord
 * Remove TODOS os emojis do servidor, independente do mapeamento
 * @param guild
 */
async function removeAllCustomEmojis(guild) {
    const results = {
        success: 0,
        failed: 0,
        errors: [],
    };
    // Fetch all emojis from the server
    let serverEmojis;
    try {
        serverEmojis = await guild.emojis.fetch();
    }
    catch (error) {
        results.errors.push(`Failed to fetch server emojis: ${error.message}`);
        return results;
    }
    if (serverEmojis.size === 0) {
        results.errors.push("No emojis found on server");
        return results;
    }
    // Remove ALL emojis from the server (not just from mapping)
    const deletePromises = serverEmojis.map(async (emoji) => {
        try {
            await emoji.delete("Removed via Sheriff Rex Bot");
            return { success: true, name: emoji.name || emoji.id };
        }
        catch (error) {
            return {
                success: false,
                name: emoji.name || emoji.id,
                error: error.message,
            };
        }
    });
    // Wait for all deletions to complete
    const deleteResults = await Promise.allSettled(deletePromises);
    // Process results
    for (const result of deleteResults) {
        if (result.status === "fulfilled") {
            const { success, name, error } = result.value;
            if (success) {
                results.success++;
            }
            else {
                results.failed++;
                results.errors.push(`${name}: ${error}`);
            }
        }
        else {
            results.failed++;
            results.errors.push(`Unknown error: ${result.reason}`);
        }
    }
    // Clear the mapping file completely
    saveEmojiMapping({});
    return results;
}
//# sourceMappingURL=emojiUploader.js.map