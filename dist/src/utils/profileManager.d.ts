interface UserProfile {
    bio: string;
    background: string | null;
    phrase?: string;
    ownedBackgrounds?: string[];
    colorTheme?: string;
}
export declare function getUserProfile(userId: string): UserProfile;
export declare function setUserBio(userId: string, bio: string): boolean;
export declare function setUserBackground(userId: string, backgroundName: string): boolean;
export declare function setUserProfile(userId: string, profile: UserProfile): boolean;
export declare function setUserPhrase(userId: string, phrase: string): boolean;
export declare function setUserColorTheme(userId: string, themeId: string): boolean;
export declare function getUserColorTheme(userId: string): string;
export {};
//# sourceMappingURL=profileManager.d.ts.map