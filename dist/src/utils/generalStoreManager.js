"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GENERAL_STORE_ITEMS = void 0;
exports.getAllStoreItems = getAllStoreItems;
exports.getStoreItemsByCategory = getStoreItemsByCategory;
exports.getStoreItemById = getStoreItemById;
exports.getCategoryName = getCategoryName;
exports.getItemImagePath = getItemImagePath;
exports.getCategoryEmoji = getCategoryEmoji;
const inventoryManager_1 = require("./inventoryManager");
const path_1 = __importDefault(require("path"));
exports.GENERAL_STORE_ITEMS = [
    {
        id: 'pickaxe',
        name: 'Picareta Lendária',
        description: 'Uma picareta lendária que aumenta massivamente sua produção de ouro na mineração solo (16-28 barras ao invés de 1-3)',
        price: 30,
        emoji: inventoryManager_1.ITEMS.pickaxe.emoji,
        imageFile: 'https://i.postimg.cc/Hnhw0hQ7/IMG-3437.png',
        category: 'tools',
    },
    {
        id: 'leather_backpack',
        name: 'Mochila de Couro',
        description: 'Mochila resistente de couro curtido que aumenta sua capacidade de carga em +200kg',
        price: 500,
        emoji: '🎒',
        imageFile: 'https://i.postimg.cc/JhLbQJBj/IMG-3440.png',
        category: 'backpacks',
        backpackCapacity: 200,
    },
    {
        id: 'bear_backpack',
        name: 'Mochila de Couro de Urso',
        description: 'Mochila premium feita com couro de urso, extremamente resistente. Aumenta capacidade em +350kg',
        price: 1200,
        emoji: '🎒',
        imageFile: 'https://i.postimg.cc/tR6kjXNT/IMG-3438.png',
        category: 'backpacks',
        backpackCapacity: 350,
    },
    {
        id: 'gold_backpack',
        name: 'Mochila Banhada a Ouro',
        description: 'A mochila definitiva! Banhada a ouro e reforçada com as melhores tecnologias. Aumenta capacidade em +500kg',
        price: 2500,
        emoji: '🎒',
        imageFile: 'https://i.postimg.cc/4NB9CMMB/IMG-3439.png',
        category: 'backpacks',
        backpackCapacity: 500,
    },
];
function getAllStoreItems() {
    return exports.GENERAL_STORE_ITEMS;
}
function getStoreItemsByCategory(category) {
    if (category === 'all') {
        return exports.GENERAL_STORE_ITEMS;
    }
    return exports.GENERAL_STORE_ITEMS.filter((item) => item.category === category);
}
function getStoreItemById(itemId) {
    return exports.GENERAL_STORE_ITEMS.find((item) => item.id === itemId) || null;
}
function getCategoryName(category) {
    switch (category) {
        case 'tools':
            return 'Ferramentas';
        case 'backpacks':
            return 'Mochilas';
        case 'all':
            return 'Todos';
        default:
            return 'Todos';
    }
}
function getItemImagePath(imageFile) {
    return path_1.default.join(process.cwd(), 'assets', 'shop-items', imageFile);
}
function getCategoryEmoji(category) {
    switch (category) {
        case 'tools':
            return '⚒️';
        case 'consumables':
            return '🍖';
        case 'backpacks':
            return '🎒';
        default:
            return '📦';
    }
}
//# sourceMappingURL=generalStoreManager.js.map