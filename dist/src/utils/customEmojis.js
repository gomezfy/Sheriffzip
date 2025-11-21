"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMOJI_TEXT = exports.CUSTOM_EMOJIS = exports.APPLICATION_EMOJIS = void 0;
exports.getEmoji = getEmoji;
exports.getCustomEmojiPath = getCustomEmojiPath;
exports.getEmojiText = getEmojiText;
exports.getEmojiForCanvas = getEmojiForCanvas;
exports.getSilverCoinEmoji = getSilverCoinEmoji;
exports.getGoldBarEmoji = getGoldBarEmoji;
exports.getSaloonTokenEmoji = getSaloonTokenEmoji;
exports.getRexBuckEmoji = getRexBuckEmoji;
exports.getAlarmEmoji = getAlarmEmoji;
exports.getGiftEmoji = getGiftEmoji;
exports.getCowboyEmoji = getCowboyEmoji;
exports.getPickaxeEmoji = getPickaxeEmoji;
exports.getTrophyEmoji = getTrophyEmoji;
exports.getGemEmoji = getGemEmoji;
exports.getBackpackEmoji = getBackpackEmoji;
exports.getBalanceEmoji = getBalanceEmoji;
exports.getBankEmoji = getBankEmoji;
exports.getBriefcaseEmoji = getBriefcaseEmoji;
exports.getBronzeMedalEmoji = getBronzeMedalEmoji;
exports.getCancelEmoji = getCancelEmoji;
exports.getCheckEmoji = getCheckEmoji;
exports.getClockEmoji = getClockEmoji;
exports.getCowboyHorseEmoji = getCowboyHorseEmoji;
exports.getCowboysEmoji = getCowboysEmoji;
exports.getCrateEmoji = getCrateEmoji;
exports.getCrossEmoji = getCrossEmoji;
exports.getCurrencyEmoji = getCurrencyEmoji;
exports.getDartEmoji = getDartEmoji;
exports.getDiamondEmoji = getDiamondEmoji;
exports.getDustEmoji = getDustEmoji;
exports.getGoldMedalEmoji = getGoldMedalEmoji;
exports.getInfoEmoji = getInfoEmoji;
exports.getLightningEmoji = getLightningEmoji;
exports.getMoneybagEmoji = getMoneybagEmoji;
exports.getMuteEmoji = getMuteEmoji;
exports.getRevolverEmoji = getRevolverEmoji;
exports.getRunningCowboyEmoji = getRunningCowboyEmoji;
exports.getScrollEmoji = getScrollEmoji;
exports.getSilverMedalEmoji = getSilverMedalEmoji;
exports.getSparklesEmoji = getSparklesEmoji;
exports.getStarEmoji = getStarEmoji;
exports.getStatsEmoji = getStatsEmoji;
exports.getTimerEmoji = getTimerEmoji;
exports.getWarningEmoji = getWarningEmoji;
exports.getLockEmoji = getLockEmoji;
exports.getGreenCircle = getGreenCircle;
exports.getRedCircle = getRedCircle;
exports.getClipboardEmoji = getClipboardEmoji;
exports.getPartyEmoji = getPartyEmoji;
exports.getBuildingEmoji = getBuildingEmoji;
exports.getSlotMachineEmoji = getSlotMachineEmoji;
exports.getSheriffBadgeEmoji = getSheriffBadgeEmoji;
exports.getDesertEmoji = getDesertEmoji;
exports.getBeerEmoji = getBeerEmoji;
exports.getCardsEmoji = getCardsEmoji;
exports.getSwordsEmoji = getSwordsEmoji;
exports.getWrenchEmoji = getWrenchEmoji;
exports.getLinkEmoji = getLinkEmoji;
exports.getPinEmoji = getPinEmoji;
exports.getSettingsEmoji = getSettingsEmoji;
exports.getMeatRexEmoji = getMeatRexEmoji;
exports.getShowdsRexEmoji = getShowdsRexEmoji;
exports.getKnifeRexEmoji = getKnifeRexEmoji;
exports.getWheatRexEmoji = getWheatRexEmoji;
exports.getCircusTentEmoji = getCircusTentEmoji;
exports.getBearPeltEmoji = getBearPeltEmoji;
exports.getRabbitPeltEmoji = getRabbitPeltEmoji;
exports.getDeerPeltEmoji = getDeerPeltEmoji;
exports.getWolfPeltEmoji = getWolfPeltEmoji;
exports.getBisonPeltEmoji = getBisonPeltEmoji;
exports.getGiantPikeEmoji = getGiantPikeEmoji;
exports.getBasicBaitEmoji = getBasicBaitEmoji;
exports.getMythicWesternFishEmoji = getMythicWesternFishEmoji;
exports.getCatfishEmoji = getCatfishEmoji;
exports.getEagleFeatherEmoji = getEagleFeatherEmoji;
exports.getFishingRodEmoji = getFishingRodEmoji;
exports.getGoldenSturgeonEmoji = getGoldenSturgeonEmoji;
exports.getSilverTroutEmoji = getSilverTroutEmoji;
exports.getWildSalmonEmoji = getWildSalmonEmoji;
exports.getPremiumBaitEmoji = getPremiumBaitEmoji;
const database_1 = require("./database");
// Application Emojis (Emojis do Aplicativo Discord)
// Configure os IDs após fazer upload no Discord Developer Portal > Seu App > Emojis
// Formato: <:nome:ID> ou deixe vazio "" para usar fallback
exports.APPLICATION_EMOJIS = {
    // Peles de Animais
    BEAR_PELT: "<:bear_pelt:1440186109970612316>",
    RABBIT_PELT: "<:rabbit_pelt:1440186108024717393>",
    BISON_PELT: "<:bison_pelt:1440186106107793428>",
    WOLF_PELT: "<:wolf_pelt:1440186104392319128>",
    DEER_PELT: "<:deer_pelt:1440186102664138772>",
    // Armas
    REVOLVER_38: "<:revolver_38:1440186059651547249>",
    RIFLE_DE_CACA: "<:rifle_de_caca:1440186058024157236>",
    REVOLVER_VAQUEIRO: "<:revolver_vaqueiro:1440186055985987765>",
    ESCOPETA: "<:escopeta:1440186054597541999>",
    // Pesca
    GIANT_PIKE: "<:giant_pike:1441328812209209354>",
    BASIC_BAIT: "<:basic_bait:1441328810942533654>",
    MYTHIC_WESTERN_FISH: "<:mythic_western_fish:1441328809528787004>",
    CATFISH: "<:catfish:1441328808090402816>",
    EAGLE_FEATHER: "<:eagle_feather:1441328805917626490>",
    FISHING_ROD: "<:fishing_rod:1441328804818718720>",
    GOLDEN_STURGEON: "<:golden_sturgeon:1441328803207975092>",
    SILVER_TROUT: "<:silver_trout:1441328801433784401>",
    WILD_SALMON: "<:wild_salmon:1441328799454199970>",
    PREMIUM_BAIT: "<:premium_bait:1441328797684203570>",
    // Ícones de Interface
    LOCK: "<:lock_west:1440186000612659201>",
    WARNING: "<:warning_west:1440185999153037457>",
    SPARKLES: "<:sparkles_west:1440185997529710663>",
    DUST: "<:dust:1440185995596271676>",
    COWBOYS: "<:cowboys:1440185993792716910>",
    TIMER: "<:timer:1440185990328356955>",
    CRATE: "<:crate:1440185992492486838>",
    GEM: "<:gem_west:1440185978118737960>",
    CANCEL: "<:cancel:1440185987107131412>",
    LIGHTNING: "<:lightning:1440185979599065179>",
    DIAMOND: "<:diamond_west:1440185988679995503>",
    BRONZE_MEDAL: "<:bronze_medal:1440185976369582131>",
    BANK: "<:bank_west:1440185974507175947>",
    TROPHY: "<:trophy_west:1440185971210453023>",
    INFO: "<:info:1440185969537191978>",
    GOLD_MEDAL: "<:gold_medal:1440185967968256190>",
    STATS: "<:stats:1440185966311637063>",
    COWBOY: "<:cowboy:1440185964684378163>",
    BACKPACK: "<:backpack:1440185962918318181>",
    DART: "<:dart_west:1440185961081212978>",
    COWBOY_HORSE: "<:cowboy_horse:1440185959798018149>",
    SILVER_COIN: "<:silver_coin:1440185957675438080>",
    CHECK: "<:check:1440185955381280822>",
    MUTE: "<:mute_west:1440185953762152499>",
    RUNNING_COWBOY: "<:running_cowboy:1440185951228919878>",
    BRIEFCASE: "<:briefcase_west:1440185947047329863>",
    MONEYBAG: "<:moneybag_west:1440185945478398072>",
    SALOON_TOKEN: "<:saloon_token:1440185942999695391>",
    GIFT: "<:gift_west:1440185939904167967>",
    CLOCK: "<:clock:1440185938406805617>",
    SCROLL: "<:scroll_west:1440185935852605564>",
    GOLD_BAR: "<:gold_bar:1440185933722030162>",
    BALANCE: "<:balance:1440185931930927207>",
    REVOLVER: "<:revolver:1440185930311798967>",
    SILVER_MEDAL: "<:silver_medal:1440185928533672039>",
    PICKAXE: "<:pickaxe:1440185926889377872>",
    ALARM: "<:alarm:1440185923202449438>",
    CROSS: "<:cross:1440185921499562025>",
    CURRENCY: "<:currency:1440185919356407848>",
    STAR: "<:star_west:1440185917645262928>",
    // Emojis adicionais (aguardando upload no Discord Developer Portal)
    SHERIFF_BADGE: "", // 👮 Badge de xerife
    DESERT: "", // 🏜️ Deserto
    SWORDS: "", // ⚔️ Espadas
    SETTINGS: "", // ⚙️ Configurações
    // Novos Emojis Rex (Adicionados em 20/11/2025)
    MEAT_REX: "<:meat_rex:1441099820793204856>",
    SHOWDS_REX: "<:showds_rex:1441099823016181881>",
    KNIFE_REX: "<:knife_rex:1441099824756818052>",
    PIN: "<:pin_rex:1441099826442801212>",
    CARDS: "<:cards_rex:1441099828535758868>",
    BEER: "<:beer_rex:1441099830876442725>",
    LINK: "<:link_rex:1441099832864276582>",
    WHEAT_REX: "<:wheat_rex:1441099834969952408>",
    WRENCH: "<:wrench_rex:1441099836320518205>",
    CIRCUS_TENT: "<:circus_tent_rex:1441156281233834077>",
};
exports.CUSTOM_EMOJIS = {
    SALOON_TOKEN: (0, database_1.getDataPath)("assets", "saloon-token.png"),
    SILVER_COIN: (0, database_1.getDataPath)("assets", "silver-coin.png"),
    GOLD_BAR: (0, database_1.getDataPath)("assets", "gold-bar.png"),
    REX_BUCK: (0, database_1.getDataPath)("assets", "rex-buck.png"),
};
// Fallback text emojis (usados se não houver emoji customizado)
exports.EMOJI_TEXT = {
    SALOON_TOKEN: "🎫",
    SILVER_COIN: "🪙",
    GOLD_BAR: "🥇",
    REX_BUCK: "💵",
    ALARM: "🚨",
    BACKPACK: "🎒",
    BALANCE: "⚖️",
    BANK: "🏦",
    BRIEFCASE: "💼",
    BRONZE_MEDAL: "🥉",
    CANCEL: "❌",
    CHECK: "✅",
    CLOCK: "🕐",
    COWBOY_HORSE: "🏇",
    COWBOYS: "👥",
    CRATE: "📦",
    CROSS: "❌",
    CURRENCY: "💱",
    DART: "🎯",
    DIAMOND: "💎",
    DUST: "💨",
    GOLD_MEDAL: "🥇",
    INFO: "ℹ️",
    LIGHTNING: "⚡",
    MONEYBAG: "💰",
    MUTE: "🔇",
    REVOLVER: "🔫",
    RUNNING_COWBOY: "🏃",
    SCROLL: "📜",
    SILVER_MEDAL: "🥈",
    SPARKLES: "✨",
    STAR: "⭐",
    STATS: "📊",
    TIMER: "⏱️",
    WARNING: "⚠️",
    LOCK: "🔒",
    TROPHY: "🏆",
    GEM: "💎",
    COWBOY: "🤠",
    GIFT: "🎁",
    PICKAXE: "⛏️",
    // Armas (fallbacks)
    ESCOPETA: "🔫",
    REVOLVER_VAQUEIRO: "🔫",
    REVOLVER_38: "🔫",
    RIFLE_DE_CACA: "🔫",
    // Peles de Animais (fallbacks)
    RABBIT_PELT: "🐰",
    DEER_PELT: "🦌",
    WOLF_PELT: "🐺",
    BISON_PELT: "🦬",
    BEAR_PELT: "🐻",
    // Pesca (fallbacks)
    GIANT_PIKE: "🐟",
    BASIC_BAIT: "🪱",
    MYTHIC_WESTERN_FISH: "🐠",
    CATFISH: "🐟",
    EAGLE_FEATHER: "🪶",
    FISHING_ROD: "🎣",
    GOLDEN_STURGEON: "🐟",
    SILVER_TROUT: "🐟",
    WILD_SALMON: "🐟",
    PREMIUM_BAIT: "🦗",
    // Emojis adicionais
    SHERIFF_BADGE: "👮",
    DESERT: "🏜️",
    BEER: "🍺",
    CARDS: "🃏",
    SWORDS: "⚔️",
    WRENCH: "🔧",
    LINK: "🔗",
    PIN: "📍",
    SETTINGS: "⚙️",
    // Novos emojis Rex (fallbacks)
    MEAT_REX: "🥩",
    SHOWDS_REX: "👥",
    KNIFE_REX: "🔪",
    WHEAT_REX: "🌾",
    CIRCUS_TENT: "🎪",
};
/**
 * Obtém um emoji customizado do Discord com fallback para texto
 * Prioridade: Application Emoji > Emoji de Texto
 * @param emojiName Nome do emoji (ex: 'gold_bar', 'silver_coin')
 */
function getEmoji(emojiName) {
    // 1. Prioridade máxima: Application Emojis (configurados manualmente)
    const appEmojiKey = emojiName.toUpperCase();
    if (exports.APPLICATION_EMOJIS[appEmojiKey] && exports.APPLICATION_EMOJIS[appEmojiKey] !== "") {
        return exports.APPLICATION_EMOJIS[appEmojiKey];
    }
    // 2. Fallback: Emoji de texto (Unicode)
    const textKey = emojiName.toUpperCase();
    return exports.EMOJI_TEXT[textKey] || "";
}
function getCustomEmojiPath(emojiType) {
    return exports.CUSTOM_EMOJIS[emojiType] || null;
}
function getEmojiText(emojiType) {
    return exports.EMOJI_TEXT[emojiType] || "";
}
/**
 * Obtém emoji Unicode para uso em Canvas (não usa emojis customizados do Discord)
 * Use esta função em vez de getEmoji() quando estiver desenhando em canvas
 * @param emojiName Nome do emoji (ex: 'gold_medal', 'silver_coin')
 */
function getEmojiForCanvas(emojiName) {
    const textKey = emojiName.toUpperCase();
    return exports.EMOJI_TEXT[textKey] || "";
}
/**
 * Obtém o emoji de moeda de prata (APENAS customizado)
 */
function getSilverCoinEmoji() {
    return getEmoji("silver_coin");
}
/**
 * Obtém o emoji de barra de ouro (APENAS customizado)
 */
function getGoldBarEmoji() {
    return getEmoji("gold_bar");
}
/**
 * Obtém o emoji de token do saloon (APENAS customizado)
 */
function getSaloonTokenEmoji() {
    return getEmoji("saloon_token");
}
/**
 * Obtém o emoji de RexBuck (moeda premium)
 */
function getRexBuckEmoji() {
    return getEmoji("rex_buck");
}
// Funções auxiliares para os custom emojis (SEM fallback de texto)
function getAlarmEmoji() {
    return getEmoji("alarm");
}
function getGiftEmoji() {
    return getEmoji("gift");
}
function getCowboyEmoji() {
    return getEmoji("cowboy");
}
function getPickaxeEmoji() {
    return getEmoji("pickaxe");
}
function getTrophyEmoji() {
    return getEmoji("trophy");
}
function getGemEmoji() {
    return getEmoji("gem");
}
function getBackpackEmoji() {
    return getEmoji("backpack");
}
function getBalanceEmoji() {
    return getEmoji("balance");
}
function getBankEmoji() {
    return getEmoji("bank");
}
function getBriefcaseEmoji() {
    return getEmoji("briefcase");
}
function getBronzeMedalEmoji() {
    return getEmoji("bronze_medal");
}
function getCancelEmoji() {
    return getEmoji("cancel");
}
function getCheckEmoji() {
    return getEmoji("check");
}
function getClockEmoji() {
    return getEmoji("clock");
}
function getCowboyHorseEmoji() {
    return getEmoji("cowboy_horse");
}
function getCowboysEmoji() {
    return getEmoji("cowboys");
}
function getCrateEmoji() {
    return getEmoji("crate");
}
function getCrossEmoji() {
    return getEmoji("cross");
}
function getCurrencyEmoji() {
    return getEmoji("currency");
}
function getDartEmoji() {
    return getEmoji("dart");
}
function getDiamondEmoji() {
    return getEmoji("diamond");
}
function getDustEmoji() {
    return getEmoji("dust");
}
function getGoldMedalEmoji() {
    return getEmoji("gold_medal");
}
function getInfoEmoji() {
    return getEmoji("info");
}
function getLightningEmoji() {
    return getEmoji("lightning");
}
function getMoneybagEmoji() {
    return getEmoji("moneybag");
}
function getMuteEmoji() {
    return getEmoji("mute");
}
function getRevolverEmoji() {
    return getEmoji("revolver");
}
function getRunningCowboyEmoji() {
    return getEmoji("running_cowboy");
}
function getScrollEmoji() {
    return getEmoji("scroll");
}
function getSilverMedalEmoji() {
    return getEmoji("silver_medal");
}
function getSparklesEmoji() {
    return getEmoji("sparkles");
}
function getStarEmoji() {
    return getEmoji("star");
}
function getStatsEmoji() {
    return getEmoji("stats");
}
function getTimerEmoji() {
    return getEmoji("timer");
}
function getWarningEmoji() {
    return getEmoji("warning");
}
function getLockEmoji() {
    return getEmoji("lock");
}
function getGreenCircle() {
    return "🟢";
}
function getRedCircle() {
    return "🔴";
}
function getClipboardEmoji() {
    return "📋";
}
function getPartyEmoji() {
    return "🎉";
}
function getBuildingEmoji() {
    return "🏛️";
}
function getSlotMachineEmoji() {
    return "🎰";
}
function getSheriffBadgeEmoji() {
    return getEmoji("sheriff_badge");
}
function getDesertEmoji() {
    return getEmoji("desert");
}
function getBeerEmoji() {
    return getEmoji("beer");
}
function getCardsEmoji() {
    return getEmoji("cards");
}
function getSwordsEmoji() {
    return getEmoji("swords");
}
function getWrenchEmoji() {
    return getEmoji("wrench");
}
function getLinkEmoji() {
    return getEmoji("link");
}
function getPinEmoji() {
    return getEmoji("pin");
}
function getSettingsEmoji() {
    return getEmoji("settings");
}
function getMeatRexEmoji() {
    return getEmoji("meat_rex");
}
function getShowdsRexEmoji() {
    return getEmoji("showds_rex");
}
function getKnifeRexEmoji() {
    return getEmoji("knife_rex");
}
function getWheatRexEmoji() {
    return getEmoji("wheat_rex");
}
function getCircusTentEmoji() {
    return getEmoji("circus_tent");
}
function getBearPeltEmoji() {
    return getEmoji("bear_pelt");
}
function getRabbitPeltEmoji() {
    return getEmoji("rabbit_pelt");
}
function getDeerPeltEmoji() {
    return getEmoji("deer_pelt");
}
function getWolfPeltEmoji() {
    return getEmoji("wolf_pelt");
}
function getBisonPeltEmoji() {
    return getEmoji("bison_pelt");
}
function getGiantPikeEmoji() {
    return getEmoji("giant_pike");
}
function getBasicBaitEmoji() {
    return getEmoji("basic_bait");
}
function getMythicWesternFishEmoji() {
    return getEmoji("mythic_western_fish");
}
function getCatfishEmoji() {
    return getEmoji("catfish");
}
function getEagleFeatherEmoji() {
    return getEmoji("eagle_feather");
}
function getFishingRodEmoji() {
    return getEmoji("fishing_rod");
}
function getGoldenSturgeonEmoji() {
    return getEmoji("golden_sturgeon");
}
function getSilverTroutEmoji() {
    return getEmoji("silver_trout");
}
function getWildSalmonEmoji() {
    return getEmoji("wild_salmon");
}
function getPremiumBaitEmoji() {
    return getEmoji("premium_bait");
}
//# sourceMappingURL=customEmojis.js.map