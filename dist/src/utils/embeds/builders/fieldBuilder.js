"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbedFieldBuilder = void 0;
class EmbedFieldBuilder {
    fields = [];
    add(name, value, inline = false) {
        this.fields.push({ name, value, inline });
        return this;
    }
    addSpacer(inline = false) {
        this.fields.push({ name: "\u200b", value: "\u200b", inline });
        return this;
    }
    addMultiple(fields) {
        this.fields.push(...fields);
        return this;
    }
    build() {
        return this.fields;
    }
    apply(embed) {
        return embed.addFields(...this.fields);
    }
}
exports.EmbedFieldBuilder = EmbedFieldBuilder;
//# sourceMappingURL=fieldBuilder.js.map