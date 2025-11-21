"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleIdioma = handleIdioma;
const discord_js_1 = require("discord.js");
const i18n_1 = require("../../../utils/i18n");
const customEmojis_1 = require("../../../utils/customEmojis");
async function handleIdioma(interaction) {
    const locale = (0, i18n_1.getLocale)(interaction);
    const cowboyEmoji = (0, customEmojis_1.getCowboyEmoji)();
    const messages = {
        "pt-BR": {
            title: "🌍 DETECÇÃO DE IDIOMA",
            desc: "Seu idioma foi detectado como **Português (Brasil)**!\n\nO bot irá responder automaticamente em português para você.",
            detected: "Idioma Detectado",
            how: "Como funciona?",
            howDesc: "O Discord informa ao bot qual idioma você usa. O bot detecta automaticamente e responde na sua língua!",
            supported: "Idiomas Suportados",
            supportedList: "🇧🇷 Português (Brasil)\n🇺🇸 English (USA)\n🇪🇸 Español (España)",
            footer: `${cowboyEmoji} Olá, parceiro!`,
        },
        "en-US": {
            title: "🌍 LANGUAGE DETECTION",
            desc: "Your language was detected as **English (USA)**!\n\nThe bot will automatically respond in English for you.",
            detected: "Detected Language",
            how: "How does it work?",
            howDesc: "Discord tells the bot which language you use. The bot automatically detects and responds in your language!",
            supported: "Supported Languages",
            supportedList: "🇧🇷 Português (Brasil)\n🇺🇸 English (USA)\n🇪🇸 Español (España)",
            footer: `${cowboyEmoji} Howdy, partner!`,
        },
        "es-ES": {
            title: "🌍 DETECCIÓN DE IDIOMA",
            desc: "¡Tu idioma fue detectado como **Español (España)**!\n\nEl bot responderá automáticamente en español para ti.",
            detected: "Idioma Detectado",
            how: "¿Cómo funciona?",
            howDesc: "Discord le dice al bot qué idioma usas. ¡El bot detecta automáticamente y responde en tu idioma!",
            supported: "Idiomas Soportados",
            supportedList: "🇧🇷 Português (Brasil)\n🇺🇸 English (USA)\n🇪🇸 Español (España)",
            footer: "¡Hola, compadre!",
        },
    };
    const msg = messages[locale];
    const embed = new discord_js_1.EmbedBuilder()
        .setColor("#00FF00")
        .setTitle(msg.title)
        .setDescription(msg.desc)
        .addFields({ name: msg.detected, value: `\`${locale}\``, inline: true }, { name: msg.how, value: msg.howDesc, inline: false }, { name: msg.supported, value: msg.supportedList, inline: false })
        .setFooter({ text: msg.footer })
        .setTimestamp();
    await interaction.reply({ embeds: [embed], flags: discord_js_1.MessageFlags.Ephemeral });
}
//# sourceMappingURL=idioma.js.map