"use strict";
/**
 * Automatic backup system for JSON data files
 * Creates daily backups with rotation (keeps last 7 days)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupManager = exports.BackupManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const database_1 = require("./database");
class BackupManager {
    dataDir;
    backupDir;
    maxBackups = 7; // Keep last 7 days
    backupTimer = null;
    constructor() {
        this.dataDir = (0, database_1.getDataPath)("data");
        this.backupDir = path_1.default.join(this.dataDir, "backups");
        // Create backup directory if it doesn't exist
        if (!fs_1.default.existsSync(this.backupDir)) {
            fs_1.default.mkdirSync(this.backupDir, { recursive: true });
            console.log("📁 Created backup directory");
        }
    }
    /**
     * Starts automatic daily backups
     */
    startAutomaticBackups() {
        // Create first backup immediately
        this.createBackup();
        // Schedule daily backups at 3 AM
        const scheduleNextBackup = () => {
            const now = new Date();
            const next3AM = new Date();
            next3AM.setHours(3, 0, 0, 0);
            // If it's past 3 AM today, schedule for tomorrow
            if (now > next3AM) {
                next3AM.setDate(next3AM.getDate() + 1);
            }
            const msUntilBackup = next3AM.getTime() - now.getTime();
            this.backupTimer = setTimeout(() => {
                this.createBackup();
                scheduleNextBackup(); // Schedule next day
            }, msUntilBackup);
            const hoursUntil = Math.floor(msUntilBackup / (1000 * 60 * 60));
            console.log(`💾 Next automatic backup in ${hoursUntil} hours`);
        };
        scheduleNextBackup();
        console.log("✅ Automatic daily backups enabled");
    }
    /**
     * Stops automatic backups
     */
    stopAutomaticBackups() {
        if (this.backupTimer) {
            clearTimeout(this.backupTimer);
            this.backupTimer = null;
            console.log("⏹️  Automatic backups stopped");
        }
    }
    /**
     * Creates a backup of all data files
     */
    createBackup() {
        try {
            const timestamp = new Date()
                .toISOString()
                .replace(/:/g, "-")
                .split(".")[0];
            const backupFileName = `backup-${timestamp}.zip`;
            const backupPath = path_1.default.join(this.backupDir, backupFileName);
            const zip = new adm_zip_1.default();
            // Files to backup
            const filesToBackup = [
                "economy.json",
                "inventory.json",
                "bounties.json",
                "welcome.json",
                "logs.json",
                "wanted.json",
                "territories.json",
                "territory-income.json",
                "xp.json",
                "profiles.json",
                "guild-config.json",
                "expedition.json",
                "daily.json",
                "mining.json",
            ];
            let backedUpCount = 0;
            for (const file of filesToBackup) {
                const filePath = path_1.default.join(this.dataDir, file);
                if (fs_1.default.existsSync(filePath)) {
                    zip.addLocalFile(filePath);
                    backedUpCount++;
                }
            }
            // Write zip file
            zip.writeZip(backupPath);
            // Clean old backups
            this.rotateBackups();
            const sizeKB = (fs_1.default.statSync(backupPath).size / 1024).toFixed(2);
            console.log(`💾 Backup created: ${backupFileName} (${sizeKB} KB, ${backedUpCount} files)`);
            return true;
        }
        catch (error) {
            console.error("❌ Failed to create backup:", error.message);
            return false;
        }
    }
    /**
     * Deletes old backups, keeping only the most recent ones
     */
    rotateBackups() {
        try {
            const files = fs_1.default
                .readdirSync(this.backupDir)
                .filter((f) => f.startsWith("backup-") && f.endsWith(".zip"))
                .map((f) => ({
                name: f,
                path: path_1.default.join(this.backupDir, f),
                time: fs_1.default.statSync(path_1.default.join(this.backupDir, f)).mtime.getTime(),
            }))
                .sort((a, b) => b.time - a.time); // Sort by newest first
            // Delete old backups beyond maxBackups
            if (files.length > this.maxBackups) {
                const toDelete = files.slice(this.maxBackups);
                for (const file of toDelete) {
                    fs_1.default.unlinkSync(file.path);
                    console.log(`🗑️  Deleted old backup: ${file.name}`);
                }
            }
        }
        catch (error) {
            console.error("Failed to rotate backups:", error.message);
        }
    }
    /**
     * Restores data from a backup file
     * @param backupFileName
     */
    async restoreBackup(backupFileName) {
        try {
            const backupPath = path_1.default.join(this.backupDir, backupFileName);
            if (!fs_1.default.existsSync(backupPath)) {
                console.error(`Backup file not found: ${backupFileName}`);
                return false;
            }
            const zip = new adm_zip_1.default(backupPath);
            zip.extractAllTo(this.dataDir, true);
            console.log(`✅ Restored backup: ${backupFileName}`);
            return true;
        }
        catch (error) {
            console.error("Failed to restore backup:", error.message);
            return false;
        }
    }
    /**
     * Lists all available backups
     */
    listBackups() {
        try {
            return fs_1.default
                .readdirSync(this.backupDir)
                .filter((f) => f.startsWith("backup-") && f.endsWith(".zip"))
                .map((f) => {
                const filePath = path_1.default.join(this.backupDir, f);
                const stats = fs_1.default.statSync(filePath);
                return {
                    name: f,
                    date: stats.mtime,
                    sizeKB: parseFloat((stats.size / 1024).toFixed(2)),
                };
            })
                .sort((a, b) => b.date.getTime() - a.date.getTime());
        }
        catch (error) {
            console.error("Failed to list backups:", error.message);
            return [];
        }
    }
}
exports.BackupManager = BackupManager;
// Export singleton instance
exports.backupManager = new BackupManager();
//# sourceMappingURL=backupManager.js.map