import { Canvas, SKRSContext2D } from "@napi-rs/canvas";
interface OptimizationOptions {
    quality?: number;
    format?: "png" | "jpeg";
    maxWidth?: number;
    maxHeight?: number;
}
export declare class CanvasOptimizer {
    static optimizeCanvas(canvas: Canvas, options?: OptimizationOptions): Promise<Buffer>;
    private static resizeCanvas;
    static createGradient(ctx: SKRSContext2D, x0: number, y0: number, x1: number, y1: number, colors: string[]): any;
    static roundRect(ctx: SKRSContext2D, x: number, y: number, width: number, height: number, radius: number | {
        tl: number;
        tr: number;
        br: number;
        bl: number;
    }): void;
    static applyTextShadow(ctx: SKRSContext2D, options?: {
        blur?: number;
        color?: string;
        offsetX?: number;
        offsetY?: number;
    }): void;
    static clearShadow(ctx: SKRSContext2D): void;
    static wrapText(ctx: SKRSContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void;
    static loadImageWithCache(url: string, cache?: Map<string, any>): Promise<any>;
    static drawCircularImage(ctx: SKRSContext2D, image: any, x: number, y: number, radius: number): void;
}
export declare const imageCache: Map<string, any>;
export {};
//# sourceMappingURL=canvasOptimizer.d.ts.map