export declare const EMOJI_MAP: Record<string, string>;
export declare function getEmojiPath(emoji: string): string | null;
export declare function hasEmojis(text: string): boolean;
export declare function parseTextWithEmojis(text: string): Array<{
    type: string;
    value: string;
    path?: string | null;
}>;
//# sourceMappingURL=emojiMapper.d.ts.map