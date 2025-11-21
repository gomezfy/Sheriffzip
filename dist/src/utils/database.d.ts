/**
 * Get the canonical data path - ALWAYS uses src/data to prevent data duplication
 * This ensures data consistency across all environments (development and production)
 *
 * In production, src/data should be copied to the deployment location during build/deploy
 * @param {...any} segments
 */
export declare function getDataPath(...segments: string[]): string;
export declare function initializeDatabase(): void;
export declare function readData(filename: string): any;
export declare function writeData(filename: string, data: any): boolean;
/**
 * Clear cache for a specific file or all files
 * @param filename
 */
export declare function clearCache(filename?: string): void;
/**
 * Get cache statistics
 */
export declare function getCacheStats(): {
    size: number;
    files: string[];
};
/**
 * Restore data from backup file
 * @param filename - The data file to restore
 * @returns true if restored successfully, false otherwise
 */
export declare function restoreFromBackup(filename: string): boolean;
//# sourceMappingURL=database.d.ts.map