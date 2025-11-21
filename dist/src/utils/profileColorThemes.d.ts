export interface ColorTheme {
    id: string;
    name: string;
    nameLocalized: {
        "pt-BR": string;
        "en-US": string;
        "es-ES": string;
    };
    emoji: string;
    colors: {
        overlay: string;
        rexSignature: string;
        username: string;
        usernameSecondary: string;
        statsText: string;
        xpText: string;
        bioBoxBackground: string;
        bioBoxBorder: string;
        bioTitle: string;
        bioText: string;
        phraseBoxBackground: string;
        phraseBoxBorder: string;
        phraseQuotes: string;
        phraseText: string;
    };
}
export declare const COLOR_THEMES: ColorTheme[];
export declare function getThemeById(themeId: string): ColorTheme;
export declare function getThemeNameLocalized(themeId: string, locale: string): string;
//# sourceMappingURL=profileColorThemes.d.ts.map