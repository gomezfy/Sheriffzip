/**
 * Automatic backup system for JSON data files
 * Creates daily backups with rotation (keeps last 7 days)
 */
export declare class BackupManager {
    private dataDir;
    private backupDir;
    private maxBackups;
    private backupTimer;
    constructor();
    /**
     * Starts automatic daily backups
     */
    startAutomaticBackups(): void;
    /**
     * Stops automatic backups
     */
    stopAutomaticBackups(): void;
    /**
     * Creates a backup of all data files
     */
    createBackup(): boolean;
    /**
     * Deletes old backups, keeping only the most recent ones
     */
    private rotateBackups;
    /**
     * Restores data from a backup file
     * @param backupFileName
     */
    restoreBackup(backupFileName: string): Promise<boolean>;
    /**
     * Lists all available backups
     */
    listBackups(): Array<{
        name: string;
        date: Date;
        sizeKB: number;
    }>;
}
export declare const backupManager: BackupManager;
//# sourceMappingURL=backupManager.d.ts.map