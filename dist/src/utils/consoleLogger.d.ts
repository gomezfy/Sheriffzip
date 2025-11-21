/**
 * Enhanced Console Logger for Sheriff Rex Bot
 * Provides colored, timestamped, and leveled logging
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    SUCCESS = 2,
    WARN = 3,
    ERROR = 4
}
declare class ConsoleLogger {
    private minLevel;
    private isProduction;
    constructor();
    private getTimestamp;
    private formatMessage;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    success(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, error?: any): void;
    startup(message: string): void;
    section(title: string): void;
    command(commandName: string, user: string, guild?: string): void;
    event(eventName: string, details?: string): void;
    ready(botTag: string, servers: number, users: number): void;
    table(data: Record<string, string | number | boolean>): void;
    divider(): void;
    setMinLevel(level: LogLevel): void;
}
export declare const logger: ConsoleLogger;
export default logger;
//# sourceMappingURL=consoleLogger.d.ts.map