import { Events, Message, PartialMessage } from "discord.js";
export declare const name = Events.MessageUpdate;
export declare const once = false;
export declare function execute(oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage): Promise<void>;
//# sourceMappingURL=messageUpdate.d.ts.map