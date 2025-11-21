"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbedTemplates = exports.truncateText = exports.createProgressBar = exports.formatTime = exports.formatNumber = exports.EmbedFieldBuilder = exports.SpecialEmbedTemplates = exports.ThemeEmbedTemplates = exports.BasicEmbedTemplates = void 0;
// Re-export all embed templates and builders from a central barrel file
var basicEmbeds_1 = require("./templates/basicEmbeds");
Object.defineProperty(exports, "BasicEmbedTemplates", { enumerable: true, get: function () { return basicEmbeds_1.BasicEmbedTemplates; } });
var themeEmbeds_1 = require("./templates/themeEmbeds");
Object.defineProperty(exports, "ThemeEmbedTemplates", { enumerable: true, get: function () { return themeEmbeds_1.ThemeEmbedTemplates; } });
var specialEmbeds_1 = require("./templates/specialEmbeds");
Object.defineProperty(exports, "SpecialEmbedTemplates", { enumerable: true, get: function () { return specialEmbeds_1.SpecialEmbedTemplates; } });
var fieldBuilder_1 = require("./builders/fieldBuilder");
Object.defineProperty(exports, "EmbedFieldBuilder", { enumerable: true, get: function () { return fieldBuilder_1.EmbedFieldBuilder; } });
var formatters_1 = require("./formatters");
Object.defineProperty(exports, "formatNumber", { enumerable: true, get: function () { return formatters_1.formatNumber; } });
Object.defineProperty(exports, "formatTime", { enumerable: true, get: function () { return formatters_1.formatTime; } });
Object.defineProperty(exports, "createProgressBar", { enumerable: true, get: function () { return formatters_1.createProgressBar; } });
Object.defineProperty(exports, "truncateText", { enumerable: true, get: function () { return formatters_1.truncateText; } });
// Combined EmbedTemplates class for backward compatibility
const basicEmbeds_2 = require("./templates/basicEmbeds");
const themeEmbeds_2 = require("./templates/themeEmbeds");
const specialEmbeds_2 = require("./templates/specialEmbeds");
class EmbedTemplates {
    static success = basicEmbeds_2.BasicEmbedTemplates.success;
    static error = basicEmbeds_2.BasicEmbedTemplates.error;
    static warning = basicEmbeds_2.BasicEmbedTemplates.warning;
    static info = basicEmbeds_2.BasicEmbedTemplates.info;
    static gold = basicEmbeds_2.BasicEmbedTemplates.gold;
    static western = themeEmbeds_2.ThemeEmbedTemplates.western;
    static bounty = themeEmbeds_2.ThemeEmbedTemplates.bounty;
    static mining = themeEmbeds_2.ThemeEmbedTemplates.mining;
    static leaderboard = themeEmbeds_2.ThemeEmbedTemplates.leaderboard;
    static announcement = themeEmbeds_2.ThemeEmbedTemplates.announcement;
    static profile = specialEmbeds_2.SpecialEmbedTemplates.profile;
    static economy = specialEmbeds_2.SpecialEmbedTemplates.economy;
    static cooldown = specialEmbeds_2.SpecialEmbedTemplates.cooldown;
    static pagination = specialEmbeds_2.SpecialEmbedTemplates.pagination;
}
exports.EmbedTemplates = EmbedTemplates;
//# sourceMappingURL=index.js.map