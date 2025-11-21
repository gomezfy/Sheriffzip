"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageCache = exports.CanvasOptimizer = void 0;
const canvas_1 = require("@napi-rs/canvas");
class CanvasOptimizer {
    static async optimizeCanvas(canvas, options = {}) {
        const { quality = 80, format = "png", maxWidth, maxHeight } = options;
        let finalCanvas = canvas;
        if (maxWidth || maxHeight) {
            finalCanvas = this.resizeCanvas(canvas, maxWidth, maxHeight);
        }
        if (format === "jpeg") {
            return finalCanvas.toBuffer("image/jpeg", quality);
        }
        else {
            return finalCanvas.toBuffer("image/png");
        }
    }
    static resizeCanvas(canvas, maxWidth, maxHeight) {
        let width = canvas.width;
        let height = canvas.height;
        if (maxWidth && width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }
        if (maxHeight && height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }
        const resizedCanvas = new canvas_1.Canvas(Math.floor(width), Math.floor(height));
        const ctx = resizedCanvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, width, height);
        return resizedCanvas;
    }
    static createGradient(ctx, x0, y0, x1, y1, colors) {
        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
        const step = 1 / (colors.length - 1);
        colors.forEach((color, index) => {
            gradient.addColorStop(index * step, color);
        });
        return gradient;
    }
    static roundRect(ctx, x, y, width, height, radius) {
        if (typeof radius === "number") {
            radius = { tl: radius, tr: radius, br: radius, bl: radius };
        }
        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        ctx.closePath();
    }
    static applyTextShadow(ctx, options = {}) {
        const { blur = 4, color = "rgba(0, 0, 0, 0.5)", offsetX = 2, offsetY = 2, } = options;
        ctx.shadowBlur = blur;
        ctx.shadowColor = color;
        ctx.shadowOffsetX = offsetX;
        ctx.shadowOffsetY = offsetY;
    }
    static clearShadow(ctx) {
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    static wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(" ");
        let line = "";
        let currentY = y;
        for (const word of words) {
            const testLine = `${line + word} `;
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && line.length > 0) {
                ctx.fillText(line, x, currentY);
                line = `${word} `;
                currentY += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }
    static async loadImageWithCache(url, cache = new Map()) {
        if (cache.has(url)) {
            return cache.get(url);
        }
        const { loadImage } = await Promise.resolve().then(() => __importStar(require("@napi-rs/canvas")));
        const image = await loadImage(url);
        cache.set(url, image);
        return image;
    }
    static drawCircularImage(ctx, image, x, y, radius) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(image, x, y, radius * 2, radius * 2);
        ctx.restore();
    }
}
exports.CanvasOptimizer = CanvasOptimizer;
exports.imageCache = new Map();
//# sourceMappingURL=canvasOptimizer.js.map