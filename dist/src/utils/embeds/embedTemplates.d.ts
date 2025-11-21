interface EmbedTemplate {
    id: string;
    name: string;
    nameLocalized: {
        [key: string]: string;
    };
    description: string;
    emoji: string;
    data: {
        title?: string;
        description?: string;
        color?: string;
        authorName?: string;
        authorIcon?: string;
        thumbnail?: string;
        image?: string;
        footerText?: string;
        footerIcon?: string;
        timestamp?: boolean;
        fields: Array<{
            name: string;
            value: string;
            inline: boolean;
        }>;
    };
}
export declare const EMBED_TEMPLATES: EmbedTemplate[];
export declare function getTemplateById(id: string): EmbedTemplate | undefined;
export declare function getTemplateName(template: EmbedTemplate, locale?: string): string;
export {};
//# sourceMappingURL=embedTemplates.d.ts.map