interface GuildConfig {
    logsEnabled: boolean;
    logsChannel: string;
    welcomeEnabled: boolean;
    welcomeChannel: string;
    welcomeMessage: string;
    wantedEnabled: boolean;
    wantedChannel: string;
    language: string;
}
export declare function loadConfigs(): Record<string, GuildConfig>;
export declare function loadGuildConfig(guildId: string): GuildConfig;
export declare function saveGuildConfig(guildId: string, config: GuildConfig): void;
export {};
//# sourceMappingURL=configManager.d.ts.map