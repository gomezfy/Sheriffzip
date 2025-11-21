export declare const APPLICATION_EMOJIS: {
    [key: string]: string;
};
export declare const CUSTOM_EMOJIS: {
    SALOON_TOKEN: string;
    SILVER_COIN: string;
    GOLD_BAR: string;
    REX_BUCK: string;
};
export declare const EMOJI_TEXT: {
    SALOON_TOKEN: string;
    SILVER_COIN: string;
    GOLD_BAR: string;
    REX_BUCK: string;
    ALARM: string;
    BACKPACK: string;
    BALANCE: string;
    BANK: string;
    BRIEFCASE: string;
    BRONZE_MEDAL: string;
    CANCEL: string;
    CHECK: string;
    CLOCK: string;
    COWBOY_HORSE: string;
    COWBOYS: string;
    CRATE: string;
    CROSS: string;
    CURRENCY: string;
    DART: string;
    DIAMOND: string;
    DUST: string;
    GOLD_MEDAL: string;
    INFO: string;
    LIGHTNING: string;
    MONEYBAG: string;
    MUTE: string;
    REVOLVER: string;
    RUNNING_COWBOY: string;
    SCROLL: string;
    SILVER_MEDAL: string;
    SPARKLES: string;
    STAR: string;
    STATS: string;
    TIMER: string;
    WARNING: string;
    LOCK: string;
    TROPHY: string;
    GEM: string;
    COWBOY: string;
    GIFT: string;
    PICKAXE: string;
    ESCOPETA: string;
    REVOLVER_VAQUEIRO: string;
    REVOLVER_38: string;
    RIFLE_DE_CACA: string;
    RABBIT_PELT: string;
    DEER_PELT: string;
    WOLF_PELT: string;
    BISON_PELT: string;
    BEAR_PELT: string;
    GIANT_PIKE: string;
    BASIC_BAIT: string;
    MYTHIC_WESTERN_FISH: string;
    CATFISH: string;
    EAGLE_FEATHER: string;
    FISHING_ROD: string;
    GOLDEN_STURGEON: string;
    SILVER_TROUT: string;
    WILD_SALMON: string;
    PREMIUM_BAIT: string;
    SHERIFF_BADGE: string;
    DESERT: string;
    BEER: string;
    CARDS: string;
    SWORDS: string;
    WRENCH: string;
    LINK: string;
    PIN: string;
    SETTINGS: string;
    MEAT_REX: string;
    SHOWDS_REX: string;
    KNIFE_REX: string;
    WHEAT_REX: string;
    CIRCUS_TENT: string;
};
/**
 * Obtém um emoji customizado do Discord com fallback para texto
 * Prioridade: Application Emoji > Emoji de Texto
 * @param emojiName Nome do emoji (ex: 'gold_bar', 'silver_coin')
 */
export declare function getEmoji(emojiName: string): string;
export declare function getCustomEmojiPath(emojiType: keyof typeof CUSTOM_EMOJIS): string | null;
export declare function getEmojiText(emojiType: keyof typeof EMOJI_TEXT): string;
/**
 * Obtém emoji Unicode para uso em Canvas (não usa emojis customizados do Discord)
 * Use esta função em vez de getEmoji() quando estiver desenhando em canvas
 * @param emojiName Nome do emoji (ex: 'gold_medal', 'silver_coin')
 */
export declare function getEmojiForCanvas(emojiName: string): string;
/**
 * Obtém o emoji de moeda de prata (APENAS customizado)
 */
export declare function getSilverCoinEmoji(): string;
/**
 * Obtém o emoji de barra de ouro (APENAS customizado)
 */
export declare function getGoldBarEmoji(): string;
/**
 * Obtém o emoji de token do saloon (APENAS customizado)
 */
export declare function getSaloonTokenEmoji(): string;
/**
 * Obtém o emoji de RexBuck (moeda premium)
 */
export declare function getRexBuckEmoji(): string;
export declare function getAlarmEmoji(): string;
export declare function getGiftEmoji(): string;
export declare function getCowboyEmoji(): string;
export declare function getPickaxeEmoji(): string;
export declare function getTrophyEmoji(): string;
export declare function getGemEmoji(): string;
export declare function getBackpackEmoji(): string;
export declare function getBalanceEmoji(): string;
export declare function getBankEmoji(): string;
export declare function getBriefcaseEmoji(): string;
export declare function getBronzeMedalEmoji(): string;
export declare function getCancelEmoji(): string;
export declare function getCheckEmoji(): string;
export declare function getClockEmoji(): string;
export declare function getCowboyHorseEmoji(): string;
export declare function getCowboysEmoji(): string;
export declare function getCrateEmoji(): string;
export declare function getCrossEmoji(): string;
export declare function getCurrencyEmoji(): string;
export declare function getDartEmoji(): string;
export declare function getDiamondEmoji(): string;
export declare function getDustEmoji(): string;
export declare function getGoldMedalEmoji(): string;
export declare function getInfoEmoji(): string;
export declare function getLightningEmoji(): string;
export declare function getMoneybagEmoji(): string;
export declare function getMuteEmoji(): string;
export declare function getRevolverEmoji(): string;
export declare function getRunningCowboyEmoji(): string;
export declare function getScrollEmoji(): string;
export declare function getSilverMedalEmoji(): string;
export declare function getSparklesEmoji(): string;
export declare function getStarEmoji(): string;
export declare function getStatsEmoji(): string;
export declare function getTimerEmoji(): string;
export declare function getWarningEmoji(): string;
export declare function getLockEmoji(): string;
export declare function getGreenCircle(): string;
export declare function getRedCircle(): string;
export declare function getClipboardEmoji(): string;
export declare function getPartyEmoji(): string;
export declare function getBuildingEmoji(): string;
export declare function getSlotMachineEmoji(): string;
export declare function getSheriffBadgeEmoji(): string;
export declare function getDesertEmoji(): string;
export declare function getBeerEmoji(): string;
export declare function getCardsEmoji(): string;
export declare function getSwordsEmoji(): string;
export declare function getWrenchEmoji(): string;
export declare function getLinkEmoji(): string;
export declare function getPinEmoji(): string;
export declare function getSettingsEmoji(): string;
export declare function getMeatRexEmoji(): string;
export declare function getShowdsRexEmoji(): string;
export declare function getKnifeRexEmoji(): string;
export declare function getWheatRexEmoji(): string;
export declare function getCircusTentEmoji(): string;
export declare function getBearPeltEmoji(): string;
export declare function getRabbitPeltEmoji(): string;
export declare function getDeerPeltEmoji(): string;
export declare function getWolfPeltEmoji(): string;
export declare function getBisonPeltEmoji(): string;
export declare function getGiantPikeEmoji(): string;
export declare function getBasicBaitEmoji(): string;
export declare function getMythicWesternFishEmoji(): string;
export declare function getCatfishEmoji(): string;
export declare function getEagleFeatherEmoji(): string;
export declare function getFishingRodEmoji(): string;
export declare function getGoldenSturgeonEmoji(): string;
export declare function getSilverTroutEmoji(): string;
export declare function getWildSalmonEmoji(): string;
export declare function getPremiumBaitEmoji(): string;
//# sourceMappingURL=customEmojis.d.ts.map