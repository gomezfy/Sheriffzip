import { EmbedBuilder } from "discord.js";
export declare class EmbedFieldBuilder {
    private fields;
    add(name: string, value: string, inline?: boolean): this;
    addSpacer(inline?: boolean): this;
    addMultiple(fields: Array<{
        name: string;
        value: string;
        inline?: boolean;
    }>): this;
    build(): Array<{
        name: string;
        value: string;
        inline?: boolean;
    }>;
    apply(embed: EmbedBuilder): EmbedBuilder;
}
//# sourceMappingURL=fieldBuilder.d.ts.map