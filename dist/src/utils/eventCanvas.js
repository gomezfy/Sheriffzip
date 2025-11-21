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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventCanvas = createEventCanvas;
exports.createEventsOverviewCanvas = createEventsOverviewCanvas;
exports.createPrizesCanvas = createPrizesCanvas;
exports.createClassificationCanvas = createClassificationCanvas;
const canvas_1 = require("@napi-rs/canvas");
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
const customEmojis_1 = require("./customEmojis");
// Cache para imagens PNG
const imageCache = new Map();
/**
 * Carrega uma imagem PNG dos assets
 */
async function loadEmojiImage(filename) {
    try {
        if (imageCache.has(filename)) {
            return imageCache.get(filename);
        }
        const imagePath = path_1.default.join(process.cwd(), "assets/emojispng", filename);
        if (!fs.existsSync(imagePath)) {
            console.warn(`Emoji PNG não encontrado: ${filename}`);
            return null;
        }
        const image = await (0, canvas_1.loadImage)(imagePath);
        imageCache.set(filename, image);
        return image;
    }
    catch (error) {
        console.error(`Erro ao carregar emoji PNG ${filename}:`, error);
        return null;
    }
}
// Registrar fontes
const fontsRegistered = canvas_1.GlobalFonts.families.some(f => f.family === "Nunito");
if (!fontsRegistered) {
    try {
        canvas_1.GlobalFonts.registerFromPath(path_1.default.join(process.cwd(), "assets/fonts/Nunito-Bold.ttf"), "Nunito Bold");
        canvas_1.GlobalFonts.registerFromPath(path_1.default.join(process.cwd(), "assets/fonts/Nunito-SemiBold.ttf"), "Nunito SemiBold");
        canvas_1.GlobalFonts.registerFromPath(path_1.default.join(process.cwd(), "assets/fonts/Nunito-Regular.ttf"), "Nunito");
    }
    catch (error) {
        console.warn("Falha ao carregar fontes customizadas, usando fallback");
    }
}
function drawRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}
async function createEventCanvas(data) {
    const width = 1400;
    const height = 1600;
    const canvas = (0, canvas_1.createCanvas)(width, height);
    const ctx = canvas.getContext("2d");
    // === BACKGROUND PREMIUM COM GRADIENTE RADIAL ===
    const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, height);
    bgGradient.addColorStop(0, "#1a1a2e");
    bgGradient.addColorStop(0.5, "#16213e");
    bgGradient.addColorStop(1, "#0f3460");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    // Textura sutil para dar profundidade
    ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
    for (let i = 0; i < 150; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2;
        ctx.fillRect(x, y, size, size);
    }
    // === HEADER PREMIUM ===
    const headerHeight = 180;
    const headerY = 30;
    // Sombra do header (efeito de elevação)
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowBlur = 35;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    drawRoundRect(ctx, 50, headerY, width - 100, headerHeight, 30);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    // Gradiente interno do header
    const headerGradient = ctx.createLinearGradient(0, headerY, 0, headerY + headerHeight);
    headerGradient.addColorStop(0, "rgba(255, 215, 0, 0.15)");
    headerGradient.addColorStop(1, "rgba(255, 140, 0, 0.05)");
    ctx.fillStyle = headerGradient;
    drawRoundRect(ctx, 50, headerY, width - 100, headerHeight, 30);
    ctx.fill();
    // Borda dupla dourada premium
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 6;
    drawRoundRect(ctx, 50, headerY, width - 100, headerHeight, 30);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 215, 0, 0.3)";
    ctx.lineWidth = 3;
    drawRoundRect(ctx, 56, headerY + 6, width - 112, headerHeight - 12, 27);
    ctx.stroke();
    // Título sem emoji
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 72px Nunito Bold, Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = "#FF8C00";
    ctx.shadowBlur = 30;
    ctx.fillText("EVENTOS SHERIFF REX", width / 2, headerY + 85);
    // Segundo brilho (efeito neon)
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 50;
    ctx.fillText("EVENTOS SHERIFF REX", width / 2, headerY + 85);
    ctx.shadowBlur = 0;
    // Subtítulo sem ícones
    ctx.fillStyle = "#FFF8DC";
    ctx.font = "32px Nunito SemiBold, Arial";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 10;
    ctx.fillText("Competições Semanais - Mineração & Caça", width / 2, headerY + 145);
    ctx.shadowBlur = 0;
    let currentY = 220;
    // === EVENTO DE MINERAÇÃO ===
    if (data.miningEvent && data.miningEvent.leaderboard.length > 0) {
        currentY = drawMiningEvent(ctx, data.miningEvent, currentY);
    }
    // === EVENTO DE CAÇA ===
    if (data.huntingEvent && data.huntingEvent.leaderboard.length > 0) {
        currentY = drawHuntingEvent(ctx, data.huntingEvent, currentY);
    }
    // === PRÓXIMO EVENTO ===
    if (data.nextEvent && (!data.miningEvent?.active && !data.huntingEvent?.active)) {
        drawNextEvent(ctx, data.nextEvent, currentY);
    }
    return canvas.toBuffer("image/png");
}
function drawMiningEvent(ctx, event, startY) {
    const boxWidth = 1300;
    const boxX = 50;
    let y = startY;
    // === CARD COM SOMBRA E ELEVAÇÃO ===
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;
    // Background com gradiente moderno
    const cardGradient = ctx.createLinearGradient(boxX, y, boxX, y + 750);
    cardGradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    cardGradient.addColorStop(1, "rgba(245, 245, 245, 0.95)");
    ctx.fillStyle = cardGradient;
    drawRoundRect(ctx, boxX, y, boxWidth, 750, 30);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    // Borda laranja premium
    ctx.strokeStyle = "#FF6B00";
    ctx.lineWidth = 6;
    drawRoundRect(ctx, boxX, y, boxWidth, 750, 30);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 107, 0, 0.2)";
    ctx.lineWidth = 3;
    drawRoundRect(ctx, boxX + 6, y + 6, boxWidth - 12, 738, 27);
    ctx.stroke();
    // Faixa decorativa no topo
    const bannerGradient = ctx.createLinearGradient(boxX, y, boxX, y + 90);
    bannerGradient.addColorStop(0, "rgba(255, 107, 0, 0.2)");
    bannerGradient.addColorStop(1, "rgba(255, 107, 0, 0.05)");
    ctx.fillStyle = bannerGradient;
    ctx.beginPath();
    ctx.moveTo(boxX + 30, y);
    ctx.lineTo(boxX + boxWidth - 30, y);
    ctx.arcTo(boxX + boxWidth, y, boxX + boxWidth, y + 30, 30);
    ctx.lineTo(boxX + boxWidth, y + 90);
    ctx.lineTo(boxX, y + 90);
    ctx.lineTo(boxX, y + 30);
    ctx.arcTo(boxX, y, boxX + 30, y, 30);
    ctx.fill();
    y += 55;
    // Título do evento sem emoji
    ctx.fillStyle = "#FF6B00";
    ctx.font = "bold 52px Nunito Bold, Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(255, 107, 0, 0.4)";
    ctx.shadowBlur = 18;
    ctx.fillText(event.name.toUpperCase(), 1400 / 2, y);
    ctx.shadowBlur = 0;
    y += 60;
    // Status sem emojis
    ctx.font = "bold 34px Nunito SemiBold, Arial";
    if (event.active) {
        ctx.fillStyle = "#28A745";
        ctx.shadowColor = "rgba(40, 167, 69, 0.5)";
        ctx.shadowBlur = 12;
        ctx.fillText(`ATIVO • ${event.timeRemaining}`, 1400 / 2, y);
    }
    else {
        ctx.fillStyle = "#6C757D";
        ctx.fillText("Aguardando próximo evento", 1400 / 2, y);
    }
    ctx.shadowBlur = 0;
    y += 65;
    // Cabeçalho do ranking sem emoji
    ctx.textAlign = "left";
    ctx.font = "bold 42px Nunito Bold, Arial";
    ctx.fillStyle = "#2a2a2a";
    ctx.fillText("TOP 10 MINERADORES", boxX + 50, y);
    y += 60;
    const leaderboard = event.leaderboard.slice(0, 10);
    for (let i = 0; i < leaderboard.length; i++) {
        const player = leaderboard[i];
        const rowY = y + (i * 56);
        // Card individual para cada jogador (top 3 destacado)
        if (i < 3) {
            const podiumGradient = ctx.createLinearGradient(boxX + 30, rowY - 40, boxX + 30, rowY + 15);
            if (i === 0) {
                podiumGradient.addColorStop(0, "rgba(255, 215, 0, 0.25)");
                podiumGradient.addColorStop(1, "rgba(255, 215, 0, 0.05)");
            }
            else if (i === 1) {
                podiumGradient.addColorStop(0, "rgba(192, 192, 192, 0.25)");
                podiumGradient.addColorStop(1, "rgba(192, 192, 192, 0.05)");
            }
            else {
                podiumGradient.addColorStop(0, "rgba(205, 127, 50, 0.25)");
                podiumGradient.addColorStop(1, "rgba(205, 127, 50, 0.05)");
            }
            ctx.fillStyle = podiumGradient;
            drawRoundRect(ctx, boxX + 30, rowY - 40, boxWidth - 60, 52, 15);
            ctx.fill();
            // Borda colorida para top 3
            if (i === 0)
                ctx.strokeStyle = "rgba(255, 215, 0, 0.4)";
            else if (i === 1)
                ctx.strokeStyle = "rgba(192, 192, 192, 0.4)";
            else
                ctx.strokeStyle = "rgba(205, 127, 50, 0.4)";
            ctx.lineWidth = 2;
            drawRoundRect(ctx, boxX + 30, rowY - 40, boxWidth - 60, 52, 15);
            ctx.stroke();
        }
        else if (i % 2 === 0) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.03)";
            drawRoundRect(ctx, boxX + 30, rowY - 40, boxWidth - 60, 52, 12);
            ctx.fill();
        }
        // Posição com círculo colorido
        const posX = boxX + 70;
        const posY = rowY - 14;
        const circleRadius = 22;
        // Círculo de fundo
        ctx.beginPath();
        ctx.arc(posX, posY, circleRadius, 0, Math.PI * 2);
        if (i === 0)
            ctx.fillStyle = "#FFD700";
        else if (i === 1)
            ctx.fillStyle = "#C0C0C0";
        else if (i === 2)
            ctx.fillStyle = "#CD7F32";
        else
            ctx.fillStyle = "#666666";
        ctx.fill();
        // Número da posição
        ctx.fillStyle = i < 3 ? "#000000" : "#FFFFFF";
        ctx.font = "bold 26px Nunito Bold, Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${i + 1}`, posX, rowY - 5);
        ctx.textAlign = "left";
        // Nome do jogador
        ctx.fillStyle = "#1a1a1a";
        ctx.font = "32px Nunito SemiBold, Arial";
        const maxNameLength = 20;
        const displayName = player.username.length > maxNameLength
            ? player.username.substring(0, maxNameLength) + "..."
            : player.username;
        ctx.fillText(displayName, boxX + 120, rowY);
        // Pontos com destaque
        ctx.font = "bold 34px Nunito Bold, Arial";
        ctx.fillStyle = "#FF6B00";
        ctx.textAlign = "right";
        ctx.shadowColor = "rgba(255, 107, 0, 0.4)";
        ctx.shadowBlur = 10;
        ctx.fillText(`${player.points.toLocaleString()} pts`, boxX + boxWidth - 60, rowY);
        ctx.shadowBlur = 0;
        ctx.textAlign = "left";
    }
    return startY + 800;
}
function drawHuntingEvent(ctx, event, startY) {
    const boxWidth = 1300;
    const boxX = 50;
    let y = startY;
    // === CARD COM SOMBRA E ELEVAÇÃO ===
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;
    // Background com gradiente moderno
    const cardGradient = ctx.createLinearGradient(boxX, y, boxX, y + 750);
    cardGradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    cardGradient.addColorStop(1, "rgba(245, 245, 245, 0.95)");
    ctx.fillStyle = cardGradient;
    drawRoundRect(ctx, boxX, y, boxWidth, 750, 30);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    // Borda verde premium
    ctx.strokeStyle = "#2D5A3D";
    ctx.lineWidth = 6;
    drawRoundRect(ctx, boxX, y, boxWidth, 750, 30);
    ctx.stroke();
    ctx.strokeStyle = "rgba(45, 90, 61, 0.2)";
    ctx.lineWidth = 3;
    drawRoundRect(ctx, boxX + 6, y + 6, boxWidth - 12, 738, 27);
    ctx.stroke();
    // Faixa decorativa no topo
    const bannerGradient = ctx.createLinearGradient(boxX, y, boxX, y + 90);
    bannerGradient.addColorStop(0, "rgba(45, 90, 61, 0.2)");
    bannerGradient.addColorStop(1, "rgba(45, 90, 61, 0.05)");
    ctx.fillStyle = bannerGradient;
    ctx.beginPath();
    ctx.moveTo(boxX + 30, y);
    ctx.lineTo(boxX + boxWidth - 30, y);
    ctx.arcTo(boxX + boxWidth, y, boxX + boxWidth, y + 30, 30);
    ctx.lineTo(boxX + boxWidth, y + 90);
    ctx.lineTo(boxX, y + 90);
    ctx.lineTo(boxX, y + 30);
    ctx.arcTo(boxX, y, boxX + 30, y, 30);
    ctx.fill();
    y += 55;
    // Título do evento sem emoji
    ctx.fillStyle = "#2D5A3D";
    ctx.font = "bold 52px Nunito Bold, Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(45, 90, 61, 0.4)";
    ctx.shadowBlur = 18;
    ctx.fillText(event.name.toUpperCase(), 1400 / 2, y);
    ctx.shadowBlur = 0;
    y += 60;
    // Status sem emojis
    ctx.font = "bold 34px Nunito SemiBold, Arial";
    if (event.active) {
        ctx.fillStyle = "#28A745";
        ctx.shadowColor = "rgba(40, 167, 69, 0.5)";
        ctx.shadowBlur = 12;
        ctx.fillText(`ATIVO • ${event.timeRemaining}`, 1400 / 2, y);
    }
    else {
        ctx.fillStyle = "#6C757D";
        ctx.fillText("Aguardando próximo evento", 1400 / 2, y);
    }
    ctx.shadowBlur = 0;
    y += 65;
    // Cabeçalho do ranking sem emoji
    ctx.textAlign = "left";
    ctx.font = "bold 42px Nunito Bold, Arial";
    ctx.fillStyle = "#2a2a2a";
    ctx.fillText("TOP 10 CAÇADORES", boxX + 50, y);
    y += 60;
    const leaderboard = event.leaderboard.slice(0, 10);
    for (let i = 0; i < leaderboard.length; i++) {
        const player = leaderboard[i];
        const rowY = y + (i * 56);
        // Card individual para cada jogador (top 3 destacado)
        if (i < 3) {
            const podiumGradient = ctx.createLinearGradient(boxX + 30, rowY - 40, boxX + 30, rowY + 15);
            if (i === 0) {
                podiumGradient.addColorStop(0, "rgba(255, 215, 0, 0.25)");
                podiumGradient.addColorStop(1, "rgba(255, 215, 0, 0.05)");
            }
            else if (i === 1) {
                podiumGradient.addColorStop(0, "rgba(192, 192, 192, 0.25)");
                podiumGradient.addColorStop(1, "rgba(192, 192, 192, 0.05)");
            }
            else {
                podiumGradient.addColorStop(0, "rgba(205, 127, 50, 0.25)");
                podiumGradient.addColorStop(1, "rgba(205, 127, 50, 0.05)");
            }
            ctx.fillStyle = podiumGradient;
            drawRoundRect(ctx, boxX + 30, rowY - 40, boxWidth - 60, 52, 15);
            ctx.fill();
            // Borda colorida para top 3
            if (i === 0)
                ctx.strokeStyle = "rgba(255, 215, 0, 0.4)";
            else if (i === 1)
                ctx.strokeStyle = "rgba(192, 192, 192, 0.4)";
            else
                ctx.strokeStyle = "rgba(205, 127, 50, 0.4)";
            ctx.lineWidth = 2;
            drawRoundRect(ctx, boxX + 30, rowY - 40, boxWidth - 60, 52, 15);
            ctx.stroke();
        }
        else if (i % 2 === 0) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.03)";
            drawRoundRect(ctx, boxX + 30, rowY - 40, boxWidth - 60, 52, 12);
            ctx.fill();
        }
        // Posição com círculo colorido
        const posX = boxX + 70;
        const posY = rowY - 14;
        const circleRadius = 22;
        // Círculo de fundo
        ctx.beginPath();
        ctx.arc(posX, posY, circleRadius, 0, Math.PI * 2);
        if (i === 0)
            ctx.fillStyle = "#FFD700";
        else if (i === 1)
            ctx.fillStyle = "#C0C0C0";
        else if (i === 2)
            ctx.fillStyle = "#CD7F32";
        else
            ctx.fillStyle = "#666666";
        ctx.fill();
        // Número da posição
        ctx.fillStyle = i < 3 ? "#000000" : "#FFFFFF";
        ctx.font = "bold 26px Nunito Bold, Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${i + 1}`, posX, rowY - 5);
        ctx.textAlign = "left";
        // Nome do jogador
        ctx.fillStyle = "#1a1a1a";
        ctx.font = "32px Nunito SemiBold, Arial";
        const maxNameLength = 20;
        const displayName = player.username.length > maxNameLength
            ? player.username.substring(0, maxNameLength) + "..."
            : player.username;
        ctx.fillText(displayName, boxX + 120, rowY);
        // Pontos com destaque
        ctx.font = "bold 34px Nunito Bold, Arial";
        ctx.fillStyle = "#2D5A3D";
        ctx.textAlign = "right";
        ctx.shadowColor = "rgba(45, 90, 61, 0.4)";
        ctx.shadowBlur = 10;
        ctx.fillText(`${player.points.toLocaleString()} pts`, boxX + boxWidth - 60, rowY);
        ctx.shadowBlur = 0;
        ctx.textAlign = "left";
    }
    return startY + 800;
}
function drawNextEvent(ctx, nextEvent, startY) {
    const boxWidth = 1120;
    const boxX = 40;
    let y = startY;
    // === CARD COM SOMBRA ===
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 6;
    // Background com gradiente
    const cardGradient = ctx.createLinearGradient(boxX, y, boxX, y + 200);
    cardGradient.addColorStop(0, "rgba(255, 255, 255, 0.98)");
    cardGradient.addColorStop(1, "rgba(255, 250, 240, 0.98)");
    ctx.fillStyle = cardGradient;
    drawRoundRect(ctx, boxX, y, boxWidth, 200, 25);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    // Borda dourada dupla
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 4;
    drawRoundRect(ctx, boxX, y, boxWidth, 200, 25);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 215, 0, 0.3)";
    ctx.lineWidth = 2;
    drawRoundRect(ctx, boxX + 4, y + 4, boxWidth - 8, 192, 22);
    ctx.stroke();
    y += 55;
    // Título com ícone customizado
    const alarmEmoji = (0, customEmojis_1.getEmojiForCanvas)("alarm");
    const clockEmoji = (0, customEmojis_1.getEmojiForCanvas)("clock");
    ctx.fillStyle = "#FF6B00";
    ctx.font = "bold 42px Nunito Bold, Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(255, 107, 0, 0.3)";
    ctx.shadowBlur = 12;
    ctx.fillText(`${alarmEmoji} PRÓXIMO EVENTO ${clockEmoji}`, width / 2, y);
    ctx.shadowBlur = 0;
    y += 50;
    // Data
    ctx.fillStyle = "#2a2a2a";
    ctx.font = "32px Nunito SemiBold, Arial";
    ctx.fillText(`📅 ${nextEvent.date}`, width / 2, y);
    y += 45;
    // Tempo até com destaque
    const timerEmoji = (0, customEmojis_1.getEmojiForCanvas)("timer");
    ctx.fillStyle = "#28A745";
    ctx.font = "bold 34px Nunito Bold, Arial";
    ctx.shadowColor = "rgba(40, 167, 69, 0.4)";
    ctx.shadowBlur = 10;
    ctx.fillText(`${timerEmoji} Começa em: ${nextEvent.timeUntil}`, width / 2, y);
    ctx.shadowBlur = 0;
}
const width = 1200;
/**
 * Create events overview canvas showing active and next events
 *
 * @param nextEventType - Type of next scheduled event (always "mining" in practice,
 *                        as hunting events are initiated manually and have no fixed schedule)
 */
async function createEventsOverviewCanvas(miningActive, miningTimeRemaining, huntingActive, huntingTimeRemaining, nextEventType, nextEventName, nextEventDate, nextEventTimeUntil) {
    const canvasWidth = 1400;
    const canvasHeight = 1100;
    const canvas = (0, canvas_1.createCanvas)(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");
    // === BACKGROUND PREMIUM COM GRADIENTE RADIAL ===
    const bgGradient = ctx.createRadialGradient(canvasWidth / 2, canvasHeight / 2, 0, canvasWidth / 2, canvasHeight / 2, canvasHeight);
    bgGradient.addColorStop(0, "#FFD700"); // Dourado central
    bgGradient.addColorStop(0.4, "#FFA500"); // Laranja
    bgGradient.addColorStop(0.7, "#FF8C00"); // Laranja escuro
    bgGradient.addColorStop(1, "#CC6600"); // Marrom queimado
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    // Textura sutil
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    for (let i = 0; i < 80; i++) {
        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight;
        const size = Math.random() * 3;
        ctx.fillRect(x, y, size, size);
    }
    ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    // === HEADER PREMIUM ===
    const headerHeight = 160;
    const headerY = 30;
    // Sombra do header
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    drawRoundRect(ctx, 40, headerY, canvasWidth - 80, headerHeight, 25);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    // Gradiente interno do header
    const headerGradient = ctx.createLinearGradient(0, headerY, 0, headerY + headerHeight);
    headerGradient.addColorStop(0, "rgba(0, 0, 0, 0.9)");
    headerGradient.addColorStop(1, "rgba(40, 20, 0, 0.9)");
    ctx.fillStyle = headerGradient;
    drawRoundRect(ctx, 40, headerY, canvasWidth - 80, headerHeight, 25);
    ctx.fill();
    // Borda dupla dourada premium
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 5;
    drawRoundRect(ctx, 40, headerY, canvasWidth - 80, headerHeight, 25);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 215, 0, 0.4)";
    ctx.lineWidth = 2;
    drawRoundRect(ctx, 45, headerY + 5, canvasWidth - 90, headerHeight - 10, 22);
    ctx.stroke();
    // Título com brilho neon
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 68px Nunito Bold, Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = "#FF8C00";
    ctx.shadowBlur = 25;
    ctx.fillText("EVENTOS SHERIFF REX", canvasWidth / 2, headerY + 75);
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur = 40;
    ctx.fillText("EVENTOS SHERIFF REX", canvasWidth / 2, headerY + 75);
    ctx.shadowBlur = 0;
    // Subtítulo
    ctx.fillStyle = "#FFF8DC";
    ctx.font = "30px Nunito SemiBold, Arial";
    ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
    ctx.shadowBlur = 8;
    ctx.fillText("Competições Ativas & Programadas", canvasWidth / 2, headerY + 130);
    ctx.shadowBlur = 0;
    let currentY = 240;
    // === EVENTOS ATIVOS ===
    if (miningActive || huntingActive) {
        // Título da seção
        ctx.fillStyle = "#FFF";
        ctx.font = "bold 50px Nunito Bold, Arial";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
        ctx.shadowBlur = 12;
        ctx.fillText("» EVENTOS ATIVOS «", canvasWidth / 2, currentY);
        ctx.shadowBlur = 0;
        currentY += 75;
        // Card do evento de mineração (se ativo)
        if (miningActive) {
            const cardWidth = 1280;
            const cardHeight = 180;
            const cardX = (canvasWidth - cardWidth) / 2;
            // Sombra do card
            ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
            ctx.shadowBlur = 20;
            ctx.shadowOffsetY = 8;
            // Background com gradiente
            const cardGrad = ctx.createLinearGradient(cardX, currentY, cardX, currentY + cardHeight);
            cardGrad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
            cardGrad.addColorStop(1, "rgba(255, 248, 240, 0.98)");
            ctx.fillStyle = cardGrad;
            drawRoundRect(ctx, cardX, currentY, cardWidth, cardHeight, 20);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            // Borda dupla verde brilhante
            ctx.strokeStyle = "#28A745";
            ctx.lineWidth = 5;
            drawRoundRect(ctx, cardX, currentY, cardWidth, cardHeight, 20);
            ctx.stroke();
            ctx.strokeStyle = "rgba(40, 167, 69, 0.3)";
            ctx.lineWidth = 2;
            drawRoundRect(ctx, cardX + 4, currentY + 4, cardWidth - 8, cardHeight - 8, 18);
            ctx.stroke();
            // Nome do evento
            ctx.fillStyle = "#FF6B00";
            ctx.font = "bold 48px Nunito Bold, Arial";
            ctx.textAlign = "left";
            ctx.shadowColor = "rgba(255, 107, 0, 0.4)";
            ctx.shadowBlur = 10;
            ctx.fillText("⛏️ CORRIDA DO OURO", cardX + 50, currentY + 65);
            ctx.shadowBlur = 0;
            // Status ativo
            ctx.fillStyle = "#28A745";
            ctx.font = "bold 32px Nunito SemiBold, Arial";
            ctx.shadowColor = "rgba(40, 167, 69, 0.6)";
            ctx.shadowBlur = 12;
            ctx.fillText("• ATIVO AGORA", cardX + 50, currentY + 125);
            ctx.shadowBlur = 0;
            // Tempo restante
            ctx.fillStyle = "#1a1a1a";
            ctx.font = "bold 38px Nunito Bold, Arial";
            ctx.textAlign = "right";
            ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
            ctx.shadowBlur = 6;
            ctx.fillText(`⏱️ ${miningTimeRemaining}`, cardX + cardWidth - 50, currentY + 125);
            ctx.shadowBlur = 0;
            currentY += cardHeight + 45;
        }
        // Card do evento de caça (se ativo)
        if (huntingActive) {
            const cardWidth = 1280;
            const cardHeight = 180;
            const cardX = (canvasWidth - cardWidth) / 2;
            // Sombra do card
            ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
            ctx.shadowBlur = 20;
            ctx.shadowOffsetY = 8;
            // Background com gradiente
            const cardGrad = ctx.createLinearGradient(cardX, currentY, cardX, currentY + cardHeight);
            cardGrad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
            cardGrad.addColorStop(1, "rgba(240, 255, 245, 0.98)");
            ctx.fillStyle = cardGrad;
            drawRoundRect(ctx, cardX, currentY, cardWidth, cardHeight, 20);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            // Borda dupla verde brilhante
            ctx.strokeStyle = "#28A745";
            ctx.lineWidth = 5;
            drawRoundRect(ctx, cardX, currentY, cardWidth, cardHeight, 20);
            ctx.stroke();
            ctx.strokeStyle = "rgba(40, 167, 69, 0.3)";
            ctx.lineWidth = 2;
            drawRoundRect(ctx, cardX + 4, currentY + 4, cardWidth - 8, cardHeight - 8, 18);
            ctx.stroke();
            // Nome do evento
            ctx.fillStyle = "#2D5A3D";
            ctx.font = "bold 48px Nunito Bold, Arial";
            ctx.textAlign = "left";
            ctx.shadowColor = "rgba(45, 90, 61, 0.4)";
            ctx.shadowBlur = 10;
            ctx.fillText("🎯 CAÇADA DO OESTE", cardX + 50, currentY + 65);
            ctx.shadowBlur = 0;
            // Status ativo
            ctx.fillStyle = "#28A745";
            ctx.font = "bold 32px Nunito SemiBold, Arial";
            ctx.shadowColor = "rgba(40, 167, 69, 0.6)";
            ctx.shadowBlur = 12;
            ctx.fillText("• ATIVO AGORA", cardX + 50, currentY + 125);
            ctx.shadowBlur = 0;
            // Tempo restante
            ctx.fillStyle = "#1a1a1a";
            ctx.font = "bold 38px Nunito Bold, Arial";
            ctx.textAlign = "right";
            ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
            ctx.shadowBlur = 6;
            ctx.fillText(`⏱️ ${huntingTimeRemaining}`, cardX + cardWidth - 50, currentY + 125);
            ctx.shadowBlur = 0;
            currentY += cardHeight + 45;
        }
    }
    // === PRÓXIMO EVENTO ===
    currentY += 35;
    // Título da seção
    ctx.fillStyle = "#FFF";
    ctx.font = "bold 50px Nunito Bold, Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowBlur = 12;
    ctx.fillText("» PRÓXIMO EVENTO «", canvasWidth / 2, currentY);
    ctx.shadowBlur = 0;
    currentY += 75;
    const cardWidth = 1280;
    const cardHeight = 200;
    const cardX = (canvasWidth - cardWidth) / 2;
    // Sombra do card
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;
    // Background com gradiente
    const nextCardGrad = ctx.createLinearGradient(cardX, currentY, cardX, currentY + cardHeight);
    nextCardGrad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
    nextCardGrad.addColorStop(1, "rgba(255, 250, 235, 0.98)");
    ctx.fillStyle = nextCardGrad;
    drawRoundRect(ctx, cardX, currentY, cardWidth, cardHeight, 20);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    // Borda dupla colorida premium
    const nextEventColor = nextEventType === "mining" ? "#FF6B00" : "#2D5A3D";
    ctx.strokeStyle = nextEventColor;
    ctx.lineWidth = 5;
    drawRoundRect(ctx, cardX, currentY, cardWidth, cardHeight, 20);
    ctx.stroke();
    ctx.strokeStyle = nextEventColor === "#FF6B00" ? "rgba(255, 107, 0, 0.3)" : "rgba(45, 90, 61, 0.3)";
    ctx.lineWidth = 2;
    drawRoundRect(ctx, cardX + 4, currentY + 4, cardWidth - 8, cardHeight - 8, 18);
    ctx.stroke();
    // Nome do evento
    ctx.fillStyle = nextEventColor;
    ctx.font = "bold 46px Nunito Bold, Arial";
    ctx.textAlign = "left";
    ctx.shadowColor = nextEventColor === "#FF6B00" ? "rgba(255, 107, 0, 0.4)" : "rgba(45, 90, 61, 0.4)";
    ctx.shadowBlur = 10;
    ctx.fillText(nextEventName.toUpperCase(), cardX + 50, currentY + 65);
    ctx.shadowBlur = 0;
    // Data
    ctx.fillStyle = "#2a2a2a";
    ctx.font = "34px Nunito SemiBold, Arial";
    ctx.fillText(`📅 ${nextEventDate}`, cardX + 50, currentY + 125);
    // Tempo até
    ctx.fillStyle = nextEventColor;
    ctx.font = "bold 38px Nunito Bold, Arial";
    ctx.textAlign = "right";
    ctx.shadowColor = nextEventColor === "#FF6B00" ? "rgba(255, 107, 0, 0.5)" : "rgba(45, 90, 61, 0.5)";
    ctx.shadowBlur = 12;
    ctx.fillText(`⏱️ ${nextEventTimeUntil}`, cardX + cardWidth - 50, currentY + 125);
    ctx.shadowBlur = 0;
    return canvas.toBuffer("image/png");
}
/**
 * Create prizes canvas for mining and hunting events
 */
async function createPrizesCanvas(eventType) {
    const width = 1200;
    const height = 1000;
    const canvas = (0, canvas_1.createCanvas)(width, height);
    const ctx = canvas.getContext("2d");
    // Background - Gradiente Western
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, "#FFA500");
    bgGradient.addColorStop(0.5, "#FFD700");
    bgGradient.addColorStop(1, "#FF8C00");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fillRect(0, 0, width, height);
    // Header
    const headerHeight = 140;
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    drawRoundRect(ctx, 40, 30, width - 80, headerHeight, 20);
    ctx.fill();
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 4;
    drawRoundRect(ctx, 40, 30, width - 80, headerHeight, 20);
    ctx.stroke();
    // Título com emoji
    const eventName = eventType === "mining" ? "MINERAÇÃO" : "CAÇA";
    const eventIcon = eventType === "mining" ? (0, customEmojis_1.getEmojiForCanvas)("pickaxe") : (0, customEmojis_1.getEmojiForCanvas)("dart");
    const sparkles = (0, customEmojis_1.getEmojiForCanvas)("sparkles");
    ctx.fillStyle = "#000000";
    ctx.font = "bold 56px Nunito Bold, Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(255, 215, 0, 0.8)";
    ctx.shadowBlur = 15;
    ctx.fillText(`${eventIcon} PRÊMIOS - ${eventName} ${sparkles}`, width / 2, 90);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#000000";
    ctx.font = "28px Nunito, Arial";
    ctx.fillText("Top 10 Jogadores Recebem Prêmios", width / 2, 140);
    // Prizes table
    const prizes = [
        { position: 1, silver: eventType === "mining" ? 300000 : 250000, tokens: eventType === "mining" ? 300 : 250, xp: eventType === "mining" ? 3500 : 3000 },
        { position: 2, silver: eventType === "mining" ? 200000 : 150000, tokens: eventType === "mining" ? 200 : 150, xp: eventType === "mining" ? 1750 : 1500 },
        { position: 3, silver: eventType === "mining" ? 100000 : 80000, tokens: eventType === "mining" ? 100 : 80, xp: eventType === "mining" ? 875 : 750 },
        { position: 4, silver: 50000, tokens: 50, xp: 400 },
        { position: 5, silver: 40000, tokens: 40, xp: 350 },
        { position: 6, silver: 30000, tokens: 30, xp: 300 },
        { position: 7, silver: 20000, tokens: 20, xp: 250 },
        { position: 8, silver: 15000, tokens: 15, xp: 200 },
        { position: 9, silver: 10000, tokens: 10, xp: 150 },
        { position: 10, silver: 5000, tokens: 5, xp: 100 },
    ];
    let y = 220;
    for (const prize of prizes) {
        // Box do prêmio
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        drawRoundRect(ctx, 60, y, width - 120, 70, 15);
        ctx.fill();
        // Borda colorida
        if (prize.position <= 3) {
            ctx.strokeStyle = prize.position === 1 ? "#FFD700" : prize.position === 2 ? "#C0C0C0" : "#CD7F32";
            ctx.lineWidth = 3;
            drawRoundRect(ctx, 60, y, width - 120, 70, 15);
            ctx.stroke();
        }
        // Medalha com emojis
        ctx.fillStyle = "#000000";
        ctx.font = "bold 40px Nunito Bold, Arial";
        ctx.textAlign = "left";
        let medal = "";
        if (prize.position === 1)
            medal = (0, customEmojis_1.getEmojiForCanvas)("gold_medal");
        else if (prize.position === 2)
            medal = (0, customEmojis_1.getEmojiForCanvas)("silver_medal");
        else if (prize.position === 3)
            medal = (0, customEmojis_1.getEmojiForCanvas)("bronze_medal");
        else
            medal = `${prize.position}º`;
        ctx.fillText(medal, 90, y + 48);
        // Position text
        ctx.fillStyle = "#000000";
        ctx.font = "32px Nunito SemiBold, Arial";
        ctx.textAlign = "left";
        ctx.fillText(`${prize.position}º lugar`, 160, y + 48);
        // Rewards com emojis
        ctx.font = "bold 28px Nunito Bold, Arial";
        ctx.textAlign = "right";
        ctx.fillStyle = "#000000";
        // Recompensas em linha
        const silverCoin = (0, customEmojis_1.getEmojiForCanvas)("silver_coin");
        const saloonToken = (0, customEmojis_1.getEmojiForCanvas)("saloon_token");
        const sparklesReward = (0, customEmojis_1.getEmojiForCanvas)("sparkles");
        const rewardsText = `${silverCoin} ${prize.silver.toLocaleString()} • ${saloonToken} ${prize.tokens}x • ${sparklesReward} ${prize.xp.toLocaleString()} XP`;
        ctx.fillText(rewardsText, width - 80, y + 48);
        y += 80;
    }
    return canvas.toBuffer("image/png");
}
/**
 * Create classification/leaderboard canvas
 */
async function createClassificationCanvas(eventType, leaderboard, eventName, timeRemaining, active) {
    const width = 1200;
    const height = 1000;
    const canvas = (0, canvas_1.createCanvas)(width, height);
    const ctx = canvas.getContext("2d");
    // Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, "#FFA500");
    bgGradient.addColorStop(0.5, "#FFD700");
    bgGradient.addColorStop(1, "#FF8C00");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fillRect(0, 0, width, height);
    // Header
    const headerHeight = 180;
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    drawRoundRect(ctx, 40, 30, width - 80, headerHeight, 20);
    ctx.fill();
    ctx.strokeStyle = eventType === "mining" ? "#FF6B00" : "#2D5A3D";
    ctx.lineWidth = 4;
    drawRoundRect(ctx, 40, 30, width - 80, headerHeight, 20);
    ctx.stroke();
    // Título com emoji
    const eventIcon = eventType === "mining" ? (0, customEmojis_1.getEmojiForCanvas)("pickaxe") : (0, customEmojis_1.getEmojiForCanvas)("dart");
    const sparklesIcon = (0, customEmojis_1.getEmojiForCanvas)("sparkles");
    ctx.fillStyle = "#000000";
    ctx.font = "bold 56px Nunito Bold, Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(255, 215, 0, 0.8)";
    ctx.shadowBlur = 15;
    ctx.fillText(`${eventIcon} ${eventName.toUpperCase()} ${sparklesIcon}`, width / 2, 90);
    ctx.shadowBlur = 0;
    // Status
    ctx.font = "32px Nunito, Arial";
    if (active) {
        ctx.fillStyle = "#000000";
        ctx.fillText(`✅ ATIVO - ${timeRemaining} restante`, width / 2, 140);
    }
    else {
        ctx.fillStyle = "#000000";
        ctx.fillText("⏸️ Evento Encerrado", width / 2, 140);
    }
    ctx.fillStyle = "#000000";
    ctx.font = "28px Nunito, Arial";
    ctx.fillText("🏆 TOP 10 CLASSIFICAÇÃO", width / 2, 180);
    // Leaderboard
    let y = 250;
    const top10 = leaderboard.slice(0, 10);
    if (top10.length === 0) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        drawRoundRect(ctx, 100, y, width - 200, 100, 15);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.font = "32px Nunito, Arial";
        ctx.textAlign = "center";
        ctx.fillText("Nenhum participante ainda", width / 2, y + 60);
    }
    else {
        for (let i = 0; i < top10.length; i++) {
            const player = top10[i];
            // Box do player
            ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
            drawRoundRect(ctx, 60, y, width - 120, 65, 15);
            ctx.fill();
            // Highlight top 3
            if (i < 3) {
                ctx.strokeStyle = i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : "#CD7F32";
                ctx.lineWidth = 3;
                drawRoundRect(ctx, 60, y, width - 120, 65, 15);
                ctx.stroke();
            }
            // Medalha com emojis
            ctx.fillStyle = "#000000";
            ctx.font = "bold 36px Nunito Bold, Arial";
            ctx.textAlign = "left";
            let medal = "";
            if (i === 0)
                medal = (0, customEmojis_1.getEmojiForCanvas)("gold_medal");
            else if (i === 1)
                medal = (0, customEmojis_1.getEmojiForCanvas)("silver_medal");
            else if (i === 2)
                medal = (0, customEmojis_1.getEmojiForCanvas)("bronze_medal");
            else
                medal = `${i + 1}º`;
            ctx.fillText(medal, 85, y + 45);
            // Username
            ctx.fillStyle = "#000000";
            ctx.font = "28px Nunito, Arial";
            ctx.textAlign = "left";
            const maxNameLength = 20;
            const displayName = player.username.length > maxNameLength
                ? player.username.substring(0, maxNameLength) + "..."
                : player.username;
            ctx.fillText(displayName, 200, y + 45);
            // Points
            ctx.font = "bold 28px Nunito Bold, Arial";
            ctx.fillStyle = "#000000";
            ctx.textAlign = "right";
            ctx.fillText(`${player.points.toLocaleString()} pts`, width - 100, y + 45);
            y += 72;
        }
    }
    return canvas.toBuffer("image/png");
}
//# sourceMappingURL=eventCanvas.js.map