/**
 * Canvas Asset Cache System
 * Sistema de cache para otimizar renderização de imagens do Canvas
 * Reduz tempo de carregamento em até 80%
 */
import { Image } from "@napi-rs/canvas";
declare class CanvasAssetCache {
    private cache;
    private maxCacheSize;
    private cacheLifetime;
    /**
     * Carrega uma imagem com cache (LRU - Least Recently Used)
     */
    loadImageWithCache(url: string): Promise<Image>;
    /**
     * Limpa cache excedente (mantém os mais recentes)
     */
    private cleanupCache;
    /**
     * Pré-carrega múltiplas imagens (warm up cache)
     */
    preloadImages(urls: string[]): Promise<void>;
    /**
     * Limpa todo o cache
     */
    clearCache(): void;
    private hits;
    private misses;
    /**
     * Obtém estatísticas do cache
     */
    getStats(): {
        size: number;
        maxSize: number;
        hitRate: string;
        hits: number;
        misses: number;
    };
    /**
     * Remove imagens expiradas do cache
     */
    cleanExpired(): number;
}
export declare const canvasCache: CanvasAssetCache;
/**
 * Pré-carrega assets comuns usados frequentemente
 */
export declare function preloadCommonAssets(): Promise<void>;
export {};
//# sourceMappingURL=canvasCache.d.ts.map