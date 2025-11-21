import path from "path";
import { getDataPath } from "./database";
import { getCustomEmoji } from "./emojiUploader";

// Application Emojis (Emojis do Aplicativo Discord)
// Configure os IDs após fazer upload no Discord Developer Portal > Seu App > Emojis
// Formato: <:nome:ID> ou deixe vazio "" para usar fallback
export const APPLICATION_EMOJIS: { [key: string]: string } = {
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

export const CUSTOM_EMOJIS = {
  SALOON_TOKEN: getDataPath("assets", "saloon-token.png"),
  SILVER_COIN: getDataPath("assets", "silver-coin.png"),
  GOLD_BAR: getDataPath("assets", "gold-bar.png"),
  REX_BUCK: getDataPath("assets", "rex-buck.png"),
};

// Fallback text emojis (usados se não houver emoji customizado)
export const EMOJI_TEXT = {
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
  PREMIUM_BAIT: "🪱",
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
export function getEmoji(emojiName: string): string {
  // 1. Prioridade máxima: Application Emojis (configurados manualmente)
  const appEmojiKey = emojiName.toUpperCase() as keyof typeof APPLICATION_EMOJIS;
  if (APPLICATION_EMOJIS[appEmojiKey] && APPLICATION_EMOJIS[appEmojiKey] !== "") {
    return APPLICATION_EMOJIS[appEmojiKey];
  }

  // 2. Fallback: Emoji de texto (Unicode)
  const textKey = emojiName.toUpperCase() as keyof typeof EMOJI_TEXT;
  return EMOJI_TEXT[textKey] || "";
}

export function getCustomEmojiPath(
  emojiType: keyof typeof CUSTOM_EMOJIS,
): string | null {
  return CUSTOM_EMOJIS[emojiType] || null;
}

export function getEmojiText(emojiType: keyof typeof EMOJI_TEXT): string {
  return EMOJI_TEXT[emojiType] || "";
}

/**
 * Obtém emoji Unicode para uso em Canvas (não usa emojis customizados do Discord)
 * Use esta função em vez de getEmoji() quando estiver desenhando em canvas
 * @param emojiName Nome do emoji (ex: 'gold_medal', 'silver_coin')
 */
export function getEmojiForCanvas(emojiName: string): string {
  const textKey = emojiName.toUpperCase() as keyof typeof EMOJI_TEXT;
  return EMOJI_TEXT[textKey] || "";
}

/**
 * Obtém o emoji de moeda de prata (APENAS customizado)
 */
export function getSilverCoinEmoji(): string {
  return getEmoji("silver_coin");
}

/**
 * Obtém o emoji de barra de ouro (APENAS customizado)
 */
export function getGoldBarEmoji(): string {
  return getEmoji("gold_bar");
}

/**
 * Obtém o emoji de token do saloon (APENAS customizado)
 */
export function getSaloonTokenEmoji(): string {
  return getEmoji("saloon_token");
}

/**
 * Obtém o emoji de RexBuck (moeda premium)
 */
export function getRexBuckEmoji(): string {
  return getEmoji("rex_buck");
}

// Funções auxiliares para os custom emojis (SEM fallback de texto)
export function getAlarmEmoji(): string {
  return getEmoji("alarm");
}
export function getGiftEmoji(): string {
  return getEmoji("gift");
}
export function getCowboyEmoji(): string {
  return getEmoji("cowboy");
}
export function getPickaxeEmoji(): string {
  return getEmoji("pickaxe");
}
export function getTrophyEmoji(): string {
  return getEmoji("trophy");
}
export function getGemEmoji(): string {
  return getEmoji("gem");
}
export function getBackpackEmoji(): string {
  return getEmoji("backpack");
}
export function getBalanceEmoji(): string {
  return getEmoji("balance");
}
export function getBankEmoji(): string {
  return getEmoji("bank");
}
export function getBriefcaseEmoji(): string {
  return getEmoji("briefcase");
}
export function getBronzeMedalEmoji(): string {
  return getEmoji("bronze_medal");
}
export function getCancelEmoji(): string {
  return getEmoji("cancel");
}
export function getCheckEmoji(): string {
  return getEmoji("check");
}
export function getClockEmoji(): string {
  return getEmoji("clock");
}
export function getCowboyHorseEmoji(): string {
  return getEmoji("cowboy_horse");
}
export function getCowboysEmoji(): string {
  return getEmoji("cowboys");
}
export function getCrateEmoji(): string {
  return getEmoji("crate");
}
export function getCrossEmoji(): string {
  return getEmoji("cross");
}
export function getCurrencyEmoji(): string {
  return getEmoji("currency");
}
export function getDartEmoji(): string {
  return getEmoji("dart");
}
export function getDiamondEmoji(): string {
  return getEmoji("diamond");
}
export function getDustEmoji(): string {
  return getEmoji("dust");
}
export function getGoldMedalEmoji(): string {
  return getEmoji("gold_medal");
}
export function getInfoEmoji(): string {
  return getEmoji("info");
}
export function getLightningEmoji(): string {
  return getEmoji("lightning");
}
export function getMoneybagEmoji(): string {
  return getEmoji("moneybag");
}
export function getMuteEmoji(): string {
  return getEmoji("mute");
}
export function getRevolverEmoji(): string {
  return getEmoji("revolver");
}
export function getRunningCowboyEmoji(): string {
  return getEmoji("running_cowboy");
}
export function getScrollEmoji(): string {
  return getEmoji("scroll");
}
export function getSilverMedalEmoji(): string {
  return getEmoji("silver_medal");
}
export function getSparklesEmoji(): string {
  return getEmoji("sparkles");
}
export function getStarEmoji(): string {
  return getEmoji("star");
}
export function getStatsEmoji(): string {
  return getEmoji("stats");
}
export function getTimerEmoji(): string {
  return getEmoji("timer");
}
export function getWarningEmoji(): string {
  return getEmoji("warning");
}
export function getLockEmoji(): string {
  return getEmoji("lock");
}
export function getGreenCircle(): string {
  return "🟢";
}
export function getRedCircle(): string {
  return "🔴";
}
export function getClipboardEmoji(): string {
  return "📋";
}
export function getPartyEmoji(): string {
  return "🎉";
}
export function getBuildingEmoji(): string {
  return "🏛️";
}
export function getSlotMachineEmoji(): string {
  return "🎰";
}
export function getSheriffBadgeEmoji(): string {
  return getEmoji("sheriff_badge");
}
export function getDesertEmoji(): string {
  return getEmoji("desert");
}
export function getBeerEmoji(): string {
  return getEmoji("beer");
}
export function getCardsEmoji(): string {
  return getEmoji("cards");
}
export function getSwordsEmoji(): string {
  return getEmoji("swords");
}
export function getWrenchEmoji(): string {
  return getEmoji("wrench");
}
export function getLinkEmoji(): string {
  return getEmoji("link");
}
export function getPinEmoji(): string {
  return getEmoji("pin");
}
export function getSettingsEmoji(): string {
  return getEmoji("settings");
}
export function getMeatRexEmoji(): string {
  return getEmoji("meat_rex");
}
export function getShowdsRexEmoji(): string {
  return getEmoji("showds_rex");
}
export function getKnifeRexEmoji(): string {
  return getEmoji("knife_rex");
}
export function getWheatRexEmoji(): string {
  return getEmoji("wheat_rex");
}
export function getCircusTentEmoji(): string {
  return getEmoji("circus_tent");
}
export function getBearPeltEmoji(): string {
  return getEmoji("bear_pelt");
}
export function getRabbitPeltEmoji(): string {
  return getEmoji("rabbit_pelt");
}
export function getDeerPeltEmoji(): string {
  return getEmoji("deer_pelt");
}
export function getWolfPeltEmoji(): string {
  return getEmoji("wolf_pelt");
}
export function getBisonPeltEmoji(): string {
  return getEmoji("bison_pelt");
}
export function getGiantPikeEmoji(): string {
  return getEmoji("giant_pike");
}
export function getBasicBaitEmoji(): string {
  return getEmoji("basic_bait");
}
export function getMythicWesternFishEmoji(): string {
  return getEmoji("mythic_western_fish");
}
export function getCatfishEmoji(): string {
  return getEmoji("catfish");
}
export function getEagleFeatherEmoji(): string {
  return getEmoji("eagle_feather");
}
export function getFishingRodEmoji(): string {
  return getEmoji("fishing_rod");
}
export function getGoldenSturgeonEmoji(): string {
  return getEmoji("golden_sturgeon");
}
export function getSilverTroutEmoji(): string {
  return getEmoji("silver_trout");
}
export function getWildSalmonEmoji(): string {
  return getEmoji("wild_salmon");
}
export function getPremiumBaitEmoji(): string {
  return getEmoji("premium_bait");
}
