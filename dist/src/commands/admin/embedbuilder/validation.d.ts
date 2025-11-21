export interface ValidationResult {
    valid: boolean;
    error?: string;
}
export declare function validateURL(url: string): ValidationResult;
export declare function validateImageURL(url: string): ValidationResult;
export declare function validateEmbedLimits(embedData: {
    title?: string;
    description?: string;
    fields: Array<{
        name: string;
        value: string;
        inline: boolean;
    }>;
    footerText?: string;
    authorName?: string;
}): ValidationResult;
//# sourceMappingURL=validation.d.ts.map