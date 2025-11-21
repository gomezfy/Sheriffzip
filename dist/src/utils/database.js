"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataPath = getDataPath;
exports.initializeDatabase = initializeDatabase;
exports.readData = readData;
exports.writeData = writeData;
exports.clearCache = clearCache;
exports.getCacheStats = getCacheStats;
exports.restoreFromBackup = restoreFromBackup;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const security_1 = require("./security");
const performance_1 = require("./performance");
/**
 * Get the canonical data path - ALWAYS uses src/data to prevent data duplication
 * This ensures data consistency across all environments (development and production)
 *
 * In production, src/data should be copied to the deployment location during build/deploy
 * @param {...any} segments
 */
function getDataPath(...segments) {
    // Always use src/data as the single source of truth
    // This prevents data duplication and ensures consistency
    if (segments[0] === "data") {
        return path_1.default.join(process.cwd(), "src", ...segments);
    }
    // If path doesn't start with 'data', assume it's already absolute or relative to cwd
    return path_1.default.join(process.cwd(), ...segments);
}
// Determine data directory based on environment
const dataDir = getDataPath("data");
// In-memory cache for frequently accessed data
const dataCache = new Map();
const CACHE_TTL = 30000; // 30 seconds cache (increased for better performance)
// Cleanup old cache entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of dataCache.entries()) {
        if (now - value.timestamp > CACHE_TTL * 2) {
            dataCache.delete(key);
        }
    }
}, 60000); // Cleanup every minute
function initializeDatabase() {
    console.log(`📁 Data directory: ${dataDir}`);
    if (!fs_1.default.existsSync(dataDir)) {
        fs_1.default.mkdirSync(dataDir, { recursive: true });
        console.log("✅ Pasta data/ criada!");
    }
    const requiredFiles = [
        "daily.json",
        "economy.json",
        "economy.backup.json",
        "profiles.json",
        "xp.json",
        "inventory.json",
        "wanted.json",
        "welcome.json",
        "logs.json",
        "bounties.json",
        "backgrounds.json",
        "punishment.json",
        "mining.json",
        "warns.json",
        "mutes.json",
        "mod-logs.json",
        "level-rewards.json",
        "redemption-codes.json",
        "territories.json",
        "territory-income.json",
        "expedition.json",
        "events.json",
    ];
    let created = 0;
    requiredFiles.forEach((filename) => {
        const filePath = path_1.default.join(dataDir, filename);
        if (!fs_1.default.existsSync(filePath)) {
            fs_1.default.writeFileSync(filePath, "{}", "utf8");
            created++;
        }
    });
    if (created > 0) {
        console.log(`✅ Criados ${created} arquivos de dados!`);
    }
    console.log("✅ Sistema de dados pronto!");
}
function readData(filename) {
    const startTime = Date.now();
    // Security: Validate filename to prevent path traversal
    if (!(0, security_1.isValidDataFilename)(filename)) {
        console.error(`🚨 SECURITY: Invalid filename attempted: ${filename}`);
        throw new Error(`Invalid filename: ${filename}`);
    }
    // Check cache first
    const cached = dataCache.get(filename);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        (0, performance_1.measureDatabaseOperation)(`read_${filename}_cached`, startTime);
        return cached.data;
    }
    const filePath = path_1.default.join(dataDir, filename);
    try {
        if (!fs_1.default.existsSync(dataDir)) {
            fs_1.default.mkdirSync(dataDir, { recursive: true });
        }
        // Auto-restore from backup if main file is missing but backup exists
        if (!fs_1.default.existsSync(filePath) && fs_1.default.existsSync(path_1.default.join(dataDir, `${filename}.backup`))) {
            try {
                const backupPath = path_1.default.join(dataDir, `${filename}.backup`);
                const backupData = fs_1.default.readFileSync(backupPath, "utf8");
                JSON.parse(backupData); // Verify it's valid JSON
                fs_1.default.copyFileSync(backupPath, filePath);
                console.log(`✅ Auto-restored ${filename} from backup`);
            }
            catch (restoreError) {
                console.error(`⚠️  Failed to restore ${filename} from backup:`, restoreError);
            }
        }
        if (!fs_1.default.existsSync(filePath)) {
            fs_1.default.writeFileSync(filePath, "{}", "utf8");
            const emptyData = {};
            dataCache.set(filename, { data: emptyData, timestamp: Date.now() });
            (0, performance_1.measureDatabaseOperation)(`read_${filename}`, startTime);
            return emptyData;
        }
        const data = fs_1.default.readFileSync(filePath, "utf8");
        if (!data.trim()) {
            const emptyData = {};
            dataCache.set(filename, { data: emptyData, timestamp: Date.now() });
            (0, performance_1.measureDatabaseOperation)(`read_${filename}`, startTime);
            return emptyData;
        }
        const parsed = JSON.parse(data);
        // Cache the result
        dataCache.set(filename, { data: parsed, timestamp: Date.now() });
        (0, performance_1.measureDatabaseOperation)(`read_${filename}`, startTime);
        return parsed;
    }
    catch (error) {
        console.error(`❌ Erro ao ler ${filename}:`, error.message);
        (0, performance_1.measureDatabaseOperation)(`read_${filename}_error`, startTime);
        return {};
    }
}
function writeData(filename, data) {
    const startTime = Date.now();
    // Security: Validate filename to prevent path traversal
    if (!(0, security_1.isValidDataFilename)(filename)) {
        console.error(`🚨 SECURITY: Invalid filename attempted: ${filename}`);
        throw new Error(`Invalid filename: ${filename}`);
    }
    const filePath = path_1.default.join(dataDir, filename);
    const backupPath = path_1.default.join(dataDir, `${filename}.backup`);
    // Use unique temp file to avoid collision
    const uniqueId = crypto_1.default.randomBytes(8).toString("hex");
    const tempPath = path_1.default.join(dataDir, `${filename}.${uniqueId}.tmp`);
    try {
        if (!fs_1.default.existsSync(dataDir)) {
            fs_1.default.mkdirSync(dataDir, { recursive: true });
        }
        // Step 1: Write to unique temporary file
        const jsonData = JSON.stringify(data, null, 2);
        fs_1.default.writeFileSync(tempPath, jsonData, "utf8");
        // Step 2: Verify the temp file was written correctly
        const verifyData = fs_1.default.readFileSync(tempPath, "utf8");
        JSON.parse(verifyData); // This will throw if JSON is invalid
        // Step 3: Sync to disk to ensure data is persisted
        const fd = fs_1.default.openSync(tempPath, "r");
        fs_1.default.fsyncSync(fd);
        fs_1.default.closeSync(fd);
        // Step 4: Copy current file to backup (if it exists)
        if (fs_1.default.existsSync(filePath)) {
            try {
                fs_1.default.copyFileSync(filePath, backupPath);
            }
            catch (backupError) {
                console.warn(`⚠️  Failed to create backup for ${filename}:`, backupError);
            }
        }
        // Step 5: Atomic rename temp to main file (overwrites existing)
        fs_1.default.renameSync(tempPath, filePath);
        // Update cache
        dataCache.set(filename, { data: data, timestamp: Date.now() });
        (0, performance_1.measureDatabaseOperation)(`write_${filename}`, startTime);
        return true;
    }
    catch (error) {
        console.error(`❌ Erro ao escrever ${filename}:`, error.message);
        // Clean up temp file if it exists
        if (fs_1.default.existsSync(tempPath)) {
            try {
                fs_1.default.unlinkSync(tempPath);
            }
            catch {
                // Ignore cleanup errors
            }
        }
        (0, performance_1.measureDatabaseOperation)(`write_${filename}_error`, startTime);
        return false;
    }
}
/**
 * Clear cache for a specific file or all files
 * @param filename
 */
function clearCache(filename) {
    if (filename) {
        dataCache.delete(filename);
    }
    else {
        dataCache.clear();
    }
}
/**
 * Get cache statistics
 */
function getCacheStats() {
    return {
        size: dataCache.size,
        files: Array.from(dataCache.keys()),
    };
}
/**
 * Restore data from backup file
 * @param filename - The data file to restore
 * @returns true if restored successfully, false otherwise
 */
function restoreFromBackup(filename) {
    if (!(0, security_1.isValidDataFilename)(filename)) {
        console.error(`🚨 SECURITY: Invalid filename attempted: ${filename}`);
        throw new Error(`Invalid filename: ${filename}`);
    }
    const filePath = path_1.default.join(dataDir, filename);
    const backupPath = path_1.default.join(dataDir, `${filename}.backup`);
    try {
        if (!fs_1.default.existsSync(backupPath)) {
            console.error(`❌ No backup found for ${filename}`);
            return false;
        }
        // Verify backup is valid JSON
        const backupData = fs_1.default.readFileSync(backupPath, "utf8");
        JSON.parse(backupData);
        // Copy backup to main file
        fs_1.default.copyFileSync(backupPath, filePath);
        // Clear cache for this file
        dataCache.delete(filename);
        console.log(`✅ Successfully restored ${filename} from backup`);
        return true;
    }
    catch (error) {
        console.error(`❌ Failed to restore ${filename} from backup:`, error.message);
        return false;
    }
}
//# sourceMappingURL=database.js.map