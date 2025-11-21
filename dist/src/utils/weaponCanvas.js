"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWeaponCard = generateWeaponCard;
const canvas_1 = require("@napi-rs/canvas");
const path_1 = __importDefault(require("path"));
const canvasOptimizer_1 = require("./canvasOptimizer");
const axios_1 = __importDefault(require("axios"));
canvas_1.GlobalFonts.registerFromPath(path_1.default.join(process.cwd(), "assets/fonts/Nunito-Bold.ttf"), "Nunito");
canvas_1.GlobalFonts.registerFromPath(path_1.default.join(process.cwd(), "assets/fonts/Nunito-SemiBold.ttf"), "Nunito SemiBold");
function drawWoodTexture(ctx, x, y, width, height) {
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, "#3d2817");
    gradient.addColorStop(0.3, "#2c1810");
    gradient.addColorStop(0.6, "#1f1209");
    gradient.addColorStop(1, "#1a0e07");
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "rgba(139, 111, 71, 0.2)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
        const yPos = y + (height / 8) * i;
        ctx.beginPath();
        ctx.moveTo(x, yPos);
        ctx.lineTo(x + width, yPos);
        ctx.stroke();
    }
}
function drawRope(ctx, x1, y1, x2, y2) {
    const segments = 15;
    const dx = (x2 - x1) / segments;
    const dy = (y2 - y1) / segments;
    for (let i = 0; i < segments; i++) {
        const x = x1 + dx * i;
        const y = y1 + dy * i;
        const offset = Math.sin(i * 0.8) * 3;
        ctx.fillStyle = i % 2 === 0 ? "#8B7355" : "#6F5A42";
        ctx.beginPath();
        ctx.arc(x + offset, y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}
function drawStar(ctx, x, y, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const x1 = x + Math.cos(angle) * size;
        const y1 = y + Math.sin(angle) * size;
        if (i === 0)
            ctx.moveTo(x1, y1);
        else
            ctx.lineTo(x1, y1);
        const angle2 = angle + Math.PI / 5;
        const x2 = x + Math.cos(angle2) * (size * 0.4);
        const y2 = y + Math.sin(angle2) * (size * 0.4);
        ctx.lineTo(x2, y2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#8B6F47";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}
async function generateWeaponCard(weapon) {
    const width = 900;
    const height = 700;
    const canvas = (0, canvas_1.createCanvas)(width, height);
    const ctx = canvas.getContext("2d");
    drawWoodTexture(ctx, 0, 0, width, height);
    const vinhetteGradient = ctx.createRadialGradient(width / 2, height / 2, 200, width / 2, height / 2, Math.max(width, height));
    vinhetteGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    vinhetteGradient.addColorStop(1, "rgba(0, 0, 0, 0.6)");
    ctx.fillStyle = vinhetteGradient;
    ctx.fillRect(0, 0, width, height);
    drawRope(ctx, 20, 20, width - 20, 20);
    drawRope(ctx, 20, height - 20, width - 20, height - 20);
    drawRope(ctx, 20, 20, 20, height - 20);
    drawRope(ctx, width - 20, 20, width - 20, height - 20);
    ctx.strokeStyle = "#C9A05F";
    ctx.lineWidth = 10;
    ctx.strokeRect(15, 15, width - 30, height - 30);
    ctx.strokeStyle = "#8B6F47";
    ctx.lineWidth = 6;
    ctx.strokeRect(25, 25, width - 50, height - 50);
    drawStar(ctx, 60, 60, 15, "#FFD700");
    drawStar(ctx, width - 60, 60, 15, "#FFD700");
    drawStar(ctx, 60, height - 60, 15, "#FFD700");
    drawStar(ctx, width - 60, height - 60, 15, "#FFD700");
    const headerGradient = ctx.createLinearGradient(0, 40, 0, 130);
    headerGradient.addColorStop(0, "rgba(139, 111, 71, 0.5)");
    headerGradient.addColorStop(1, "rgba(139, 111, 71, 0.1)");
    ctx.fillStyle = headerGradient;
    canvasOptimizer_1.CanvasOptimizer.roundRect(ctx, 60, 40, width - 120, 90, 12);
    ctx.fill();
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 42px Nunito";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.fillText(weapon.name.toUpperCase(), width / 2, 100);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    try {
        const response = await axios_1.default.get(weapon.imageUrl, {
            responseType: "arraybuffer",
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const weaponImage = await (0, canvas_1.loadImage)(Buffer.from(response.data));
        const imageSize = 340;
        const imageX = (width - imageSize) / 2;
        const imageY = 160;
        ctx.save();
        ctx.shadowColor = "rgba(212, 165, 116, 0.6)";
        ctx.shadowBlur = 30;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        const bgSize = imageSize + 50;
        const bgX = (width - bgSize) / 2;
        const bgY = imageY - 25;
        const bgGradient = ctx.createRadialGradient(bgX + bgSize / 2, bgY + bgSize / 2, 0, bgX + bgSize / 2, bgY + bgSize / 2, bgSize / 2);
        bgGradient.addColorStop(0, "rgba(212, 165, 116, 0.4)");
        bgGradient.addColorStop(1, "rgba(139, 111, 71, 0.2)");
        ctx.fillStyle = bgGradient;
        canvasOptimizer_1.CanvasOptimizer.roundRect(ctx, bgX, bgY, bgSize, bgSize, 20);
        ctx.fill();
        ctx.strokeStyle = "#C9A05F";
        ctx.lineWidth = 4;
        canvasOptimizer_1.CanvasOptimizer.roundRect(ctx, bgX, bgY, bgSize, bgSize, 20);
        ctx.stroke();
        ctx.strokeStyle = "#8B6F47";
        ctx.lineWidth = 2;
        canvasOptimizer_1.CanvasOptimizer.roundRect(ctx, bgX + 5, bgY + 5, bgSize - 10, bgSize - 10, 18);
        ctx.stroke();
        ctx.drawImage(weaponImage, imageX, imageY, imageSize, imageSize);
        ctx.restore();
    }
    catch (error) {
        console.error("Error loading weapon image:", error);
        const imageY = 160;
        const bgSize = 390;
        const bgX = (width - bgSize) / 2;
        const bgY = imageY - 25;
        ctx.fillStyle = "rgba(139, 111, 71, 0.3)";
        canvasOptimizer_1.CanvasOptimizer.roundRect(ctx, bgX, bgY, bgSize, bgSize, 20);
        ctx.fill();
        ctx.strokeStyle = "#C9A05F";
        ctx.lineWidth = 4;
        canvasOptimizer_1.CanvasOptimizer.roundRect(ctx, bgX, bgY, bgSize, bgSize, 20);
        ctx.stroke();
        ctx.fillStyle = "#d4a574";
        ctx.font = "28px Nunito";
        ctx.textAlign = "center";
        ctx.fillText("Imagem não disponível", width / 2, imageY + bgSize / 2);
    }
    const statsY = 580;
    const statsBoxGradient = ctx.createLinearGradient(0, statsY - 50, 0, statsY + 70);
    statsBoxGradient.addColorStop(0, "rgba(139, 111, 71, 0.6)");
    statsBoxGradient.addColorStop(1, "rgba(139, 111, 71, 0.3)");
    ctx.fillStyle = statsBoxGradient;
    canvasOptimizer_1.CanvasOptimizer.roundRect(ctx, 100, statsY - 50, width - 200, 120, 18);
    ctx.fill();
    ctx.strokeStyle = "#C9A05F";
    ctx.lineWidth = 4;
    canvasOptimizer_1.CanvasOptimizer.roundRect(ctx, 100, statsY - 50, width - 200, 120, 18);
    ctx.stroke();
    ctx.strokeStyle = "#8B6F47";
    ctx.lineWidth = 2;
    canvasOptimizer_1.CanvasOptimizer.roundRect(ctx, 105, statsY - 45, width - 210, 110, 16);
    ctx.stroke();
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 32px Nunito SemiBold";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(`DANO: ${weapon.damage}`, width / 2, statsY);
    const currencyText = weapon.currency === "silver" ? "MOEDAS DE PRATA" : "OURO";
    ctx.fillStyle = "#98FB98";
    ctx.font = "bold 28px Nunito SemiBold";
    ctx.fillText(`PREÇO: ${weapon.price.toLocaleString()} ${currencyText}`, width / 2, statsY + 45);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    return canvas.toBuffer("image/png");
}
//# sourceMappingURL=weaponCanvas.js.map