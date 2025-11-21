export interface AnnouncementData {
    templates: Record<string, Template>;
    history: HistoryEntry[];
}
export interface Template {
    name: string;
    title: string;
    message: string;
    color: string;
    thumbnail?: string;
    image?: string;
    footer?: string;
}
export interface HistoryEntry {
    id: string;
    guildId: string;
    channelId: string;
    authorId: string;
    authorTag: string;
    title: string;
    timestamp: number;
}
export declare const COLOR_PRESETS: Record<string, {
    name: string;
    hex: string;
}>;
//# sourceMappingURL=index.d.ts.map