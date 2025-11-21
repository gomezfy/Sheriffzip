import { ITEMS } from './inventoryManager';
import path from 'path';

export interface GeneralStoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency?: 'tokens' | 'silver';
  emoji: string;
  imageFile?: string;
  category: 'tools' | 'consumables' | 'backpacks';
  backpackCapacity?: number;
}

export interface GeneralStoreItemImage {
  file?: string;
  url?: string;
}

export const GENERAL_STORE_ITEMS: GeneralStoreItem[] = [
  {
    id: 'fishing_rod',
    name: 'Vara de Pesca',
    description: 'Vara de pesca profissional para pescar nos rios do oeste',
    price: 800,
    currency: 'silver',
    emoji: ITEMS.fishing_rod.emoji,
    imageFile: 'https://i.postimg.cc/pyNMzMHD/IMG-3529.png',
    category: 'tools',
  },
  {
    id: 'pickaxe',
    name: 'Picareta Lendária',
    description: 'Uma picareta lendária que aumenta massivamente sua produção de ouro na mineração solo (16-28 barras ao invés de 1-3)',
    price: 30,
    emoji: ITEMS.pickaxe.emoji,
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

export function getAllStoreItems(): GeneralStoreItem[] {
  return GENERAL_STORE_ITEMS;
}

export function getStoreItemsByCategory(category: GeneralStoreItem['category'] | 'all'): GeneralStoreItem[] {
  if (category === 'all') {
    return GENERAL_STORE_ITEMS;
  }
  return GENERAL_STORE_ITEMS.filter((item) => item.category === category);
}

export function getStoreItemById(itemId: string): GeneralStoreItem | null {
  return GENERAL_STORE_ITEMS.find((item) => item.id === itemId) || null;
}

export function getCategoryName(category: string): string {
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

export function getItemImagePath(imageFile: string): string {
  return path.join(process.cwd(), 'assets', 'shop-items', imageFile);
}

export function getCategoryEmoji(category: GeneralStoreItem['category']): string {
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
