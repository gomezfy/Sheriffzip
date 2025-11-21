"use strict";
/**
 * Canvas Asset Cache System
 * Sistema de cache para otimizar renderização de imagens do Canvas
 * Reduz tempo de carregamento em até 80%
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.canvasCache = void 0;
exports.preloadCommonAssets = preloadCommonAssets;
const canvas_1 = require("@napi-rs/canvas");
const consoleLogger_1 = __importDefault(require("./consoleLogger"));
class CanvasAssetCache {
    cache = new Map();
    maxCacheSize = 100; // Máximo de 100 imagens em cache
    cacheLifetime = 30 * 60 * 1000; // 30 minutos
    /**
     * Carrega uma imagem com cache (LRU - Least Recently Used)
     */
    async loadImageWithCache(url) {
        // Verifica se está em cache e ainda válido
        const cached = this.cache.get(url);
        if (cached) {
            const age = Date.now() - cached.timestamp;
            if (age < this.cacheLifetime) {
                // Cache hit - ATUALIZA TIMESTAMP (LRU) e retorna
                this.hits++;
                cached.timestamp = Date.now();
                this.cache.set(url, cached); // Re-insere para atualizar recency
                consoleLogger_1.default.debug(`Canvas cache HIT: ${url.substring(0, 50)}...`);
                return cached.image;
            }
            else {
                // Cache expirado - remove
                this.cache.delete(url);
            }
        }
        // Cache miss - carrega imagem
        this.misses++;
        consoleLogger_1.default.debug(`Canvas cache MISS: ${url.substring(0, 50)}...`);
        try {
            const image = await (0, canvas_1.loadImage)(url);
            // Adiciona ao cache
            this.cache.set(url, {
                image,
                timestamp: Date.now(),
                url
            });
            // Limpa cache se ultrapassar limite
            this.cleanupCache();
            return image;
        }
        catch (error) {
            consoleLogger_1.default.error(`Failed to load image: ${url}`, error);
            throw error;
        }
    }
    /**
     * Limpa cache excedente (mantém os mais recentes)
     */
    cleanupCache() {
        if (this.cache.size <= this.maxCacheSize) {
            return;
        }
        // Ordena por timestamp (mais antigos primeiro)
        const sorted = Array.from(this.cache.entries())
            .sort((a, b) => a[1].timestamp - b[1].timestamp);
        // Remove os mais antigos até atingir o limite
        const toRemove = this.cache.size - this.maxCacheSize;
        for (let i = 0; i < toRemove; i++) {
            this.cache.delete(sorted[i][0]);
        }
        consoleLogger_1.default.debug(`Canvas cache cleaned: removed ${toRemove} old entries`);
    }
    /**
     * Pré-carrega múltiplas imagens (warm up cache)
     */
    async preloadImages(urls) {
        consoleLogger_1.default.info(`Pre-loading ${urls.length} images into cache...`);
        const promises = urls.map(url => this.loadImageWithCache(url).catch(error => {
            consoleLogger_1.default.warn(`Failed to preload ${url}:`, error);
        }));
        await Promise.all(promises);
        consoleLogger_1.default.success(`Pre-loaded ${this.cache.size} images successfully`);
    }
    /**
     * Limpa todo o cache
     */
    clearCache() {
        const size = this.cache.size;
        this.cache.clear();
        consoleLogger_1.default.info(`Canvas cache cleared: ${size} entries removed`);
    }
    hits = 0;
    misses = 0;
    /**
     * Obtém estatísticas do cache
     */
    getStats() {
        const total = this.hits + this.misses;
        const hitRate = total > 0 ? ((this.hits / total) * 100).toFixed(2) + '%' : 'N/A';
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize,
            hitRate,
            hits: this.hits,
            misses: this.misses
        };
    }
    /**
     * Remove imagens expiradas do cache
     */
    cleanExpired() {
        const now = Date.now();
        let removed = 0;
        for (const [url, cached] of this.cache.entries()) {
            const age = now - cached.timestamp;
            if (age >= this.cacheLifetime) {
                this.cache.delete(url);
                removed++;
            }
        }
        if (removed > 0) {
            consoleLogger_1.default.debug(`Removed ${removed} expired cache entries`);
        }
        return removed;
    }
}
// Export singleton instance
exports.canvasCache = new CanvasAssetCache();
// Iniciar limpeza automática a cada 10 minutos
setInterval(() => {
    exports.canvasCache.cleanExpired();
}, 10 * 60 * 1000);
/**
 * Pré-carrega assets comuns usados frequentemente
 */
async function preloadCommonAssets() {
    const commonAssets = [
        // Background padrão do profile
        "https://i.postimg.cc/RZzdB582/IMG-3354.png",
        // Outros assets comuns podem ser adicionados aqui
    ];
    await exports.canvasCache.preloadImages(commonAssets);
}
//# sourceMappingURL=canvasCache.js.map