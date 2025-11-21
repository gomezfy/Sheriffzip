import { GuildMember } from "discord.js";
export interface LevelReward {
    level: number;
    roleId: string;
}
export interface GuildLevelRewards {
    [guildId: string]: LevelReward[];
}
export declare function addLevelReward(guildId: string, level: number, roleId: string): {
    success: boolean;
    message: string;
};
export declare function removeLevelReward(guildId: string, level: number): {
    success: boolean;
    message: string;
};
export declare function getLevelRewards(guildId: string): LevelReward[];
export declare function checkAndGrantRewards(member: GuildMember, level: number): Promise<string[]>;
//# sourceMappingURL=levelRewards.d.ts.map