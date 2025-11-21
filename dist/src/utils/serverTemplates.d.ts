import { ChannelType } from "discord.js";
export interface TemplateRole {
    name: string;
    color: number;
    permissions: bigint[];
    hoist: boolean;
}
export interface TemplateChannel {
    name: string;
    type: ChannelType;
    topic?: string;
}
export interface TemplateCategory {
    name: string;
    channels: TemplateChannel[];
}
export interface ServerTemplate {
    id: string;
    name: string;
    description: string;
    emoji: string;
    roles: TemplateRole[];
    categories: TemplateCategory[];
}
export declare const SERVER_TEMPLATES: ServerTemplate[];
export declare function getTemplateById(id: string): ServerTemplate | undefined;
export declare function getAllTemplates(): ServerTemplate[];
//# sourceMappingURL=serverTemplates.d.ts.map