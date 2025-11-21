import { Events, GuildMember, PartialGuildMember } from "discord.js";
export declare const name = Events.GuildMemberRemove;
export declare const once = false;
export declare function execute(member: GuildMember | PartialGuildMember): Promise<void>;
//# sourceMappingURL=guildMemberRemove.d.ts.map