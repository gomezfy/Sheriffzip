import { createCanvas, loadImage, GlobalFonts, SKRSContext2D, Image } from '@napi-rs/canvas';
import path from 'path';
import fs from 'fs';
import { GeneralStoreItem } from './generalStoreManager';
import { APPLICATION_EMOJIS } from './customEmojis';
import { canvasCache } from './canvasCache';

function getEmojiImageUrl(emojiCode: string): string | null {
  const match = emojiCode.match(/<:(\w+):(\d+)>/);
  if (match) {
    const emojiId = match[2];
    return `https://cdn.discordapp.com/emojis/${emojiId}.png`;
  }
  return null;
}

async function loadEmojiImage(emojiKey: keyof typeof APPLICATION_EMOJIS): Promise<Image | null> {
  const emojiCode = APPLICATION_EMOJIS[emojiKey];
  if (!emojiCode) return null;
  
  const url = getEmojiImageUrl(emojiCode);
  if (!url) return null;
  
  try {
    return await canvasCache.loadImageWithCache(url);
  } catch (error) {
    console.error(`Error loading emoji ${emojiKey}:`, error);
    return null;
  }
}

let fontsRegistered = false;

function ensureFontsRegistered(): void {
  if (fontsRegistered) return;

  const fontsDir = path.join(process.cwd(), 'assets', 'fonts');
  
  const fontFiles = [
    { file: 'Nunito-Bold.ttf', family: 'Nunito-Bold' },
    { file: 'Nunito-SemiBold.ttf', family: 'Nunito-SemiBold' },
    { file: 'Nunito-Regular.ttf', family: 'Nunito' },
  ];

  for (const { file, family } of fontFiles) {
    const fontPath = path.join(fontsDir, file);
    if (fs.existsSync(fontPath)) {
      GlobalFonts.registerFromPath(fontPath, family);
    }
  }

  fontsRegistered = true;
}

function drawRoundedRect(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
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

function wrapText(
  ctx: SKRSContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): void {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}

export async function createStoreItemCanvas(
  item: GeneralStoreItem,
  userTokens: number,
  userHasItem: boolean,
): Promise<Buffer> {
  ensureFontsRegistered();

  const width = 900;
  const height = 750;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const gold = '#F1C40F';
  const darkGold = '#D4AF37';
  const lightGold = '#FFD700';
  const darkBg = '#1a1a1a';
  const cardBg = '#2a2a2a';

  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, darkBg);
  bgGradient.addColorStop(1, '#0f0f0f');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  const cardGradient = ctx.createLinearGradient(0, 40, 0, height - 40);
  cardGradient.addColorStop(0, 'rgba(42, 42, 42, 0.95)');
  cardGradient.addColorStop(1, 'rgba(30, 30, 30, 0.95)');
  ctx.fillStyle = cardGradient;
  drawRoundedRect(ctx, 25, 25, width - 50, height - 50, 20);
  ctx.fill();

  ctx.strokeStyle = gold;
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 25, 25, width - 50, height - 50, 20);
  ctx.stroke();

  ctx.strokeStyle = darkGold;
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, 30, 30, width - 60, height - 60, 18);
  ctx.stroke();

  ctx.fillStyle = lightGold;
  ctx.font = 'bold 44px Nunito-Bold';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(241, 196, 15, 0.5)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  ctx.fillText('LOJA GERAL', width / 2, 80);

  ctx.shadowBlur = 0;

  let itemImage;
  if (item.imageFile) {
    if (item.imageFile.startsWith('http://') || item.imageFile.startsWith('https://')) {
      try {
        itemImage = await canvasCache.loadImageWithCache(item.imageFile);
      } catch (error) {
        console.error('Error loading image from URL:', error);
      }
    } else {
      const imagePath = path.join(process.cwd(), 'assets', 'shop-items', item.imageFile);
      if (fs.existsSync(imagePath)) {
        try {
          itemImage = await canvasCache.loadImageWithCache(imagePath);
        } catch (error) {
          console.error(`Error loading image from path ${imagePath}:`, error);
        }
      } else {
        console.warn(`Image file not found: ${imagePath}`);
      }
    }
  }

  const imageSize = 260;
  const imageX = (width - imageSize) / 2;
  const imageY = 120;

  if (itemImage) {
    ctx.save();
    
    const glowGradient = ctx.createRadialGradient(
      imageX + imageSize / 2,
      imageY + imageSize / 2,
      imageSize / 3,
      imageX + imageSize / 2,
      imageY + imageSize / 2,
      imageSize / 1.5,
    );
    glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.15)');
    glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(imageX - 30, imageY - 30, imageSize + 60, imageSize + 60);

    ctx.strokeStyle = darkGold;
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, imageX - 5, imageY - 5, imageSize + 10, imageSize + 10, 12);
    ctx.stroke();

    ctx.drawImage(itemImage, imageX, imageY, imageSize, imageSize);
    ctx.restore();
  }

  ctx.fillStyle = lightGold;
  ctx.font = 'bold 38px Nunito-Bold';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
  ctx.shadowBlur = 8;
  ctx.fillText(item.name, width / 2, imageY + imageSize + 45);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#c9c9c9';
  ctx.font = '22px Nunito';
  ctx.textAlign = 'center';
  let descY = imageY + imageSize + 80;
  wrapText(ctx, item.description, width / 2, descY, width - 100, 30);
  
  if (item.category === 'backpacks' && item.backpackCapacity) {
    ctx.fillStyle = lightGold;
    ctx.font = 'bold 28px Nunito-Bold';
    ctx.fillText(`+${item.backpackCapacity}kg de Capacidade`, width / 2, descY + 95);
  }

  const priceBoxY = height - 165;
  const priceBoxHeight = 110;

  const priceGradient = ctx.createLinearGradient(0, priceBoxY, 0, priceBoxY + priceBoxHeight);
  priceGradient.addColorStop(0, 'rgba(241, 196, 15, 0.25)');
  priceGradient.addColorStop(1, 'rgba(241, 196, 15, 0.1)');
  ctx.fillStyle = priceGradient;
  drawRoundedRect(ctx, 60, priceBoxY, width - 120, priceBoxHeight, 15);
  ctx.fill();

  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 60, priceBoxY, width - 120, priceBoxHeight, 15);
  ctx.stroke();

  const saloonTokenPath = path.join(process.cwd(), 'assets', 'saloon-token.png');
  if (fs.existsSync(saloonTokenPath)) {
    try {
      const tokenImg = await canvasCache.loadImageWithCache(saloonTokenPath);
      const tokenSize = 45;
      ctx.drawImage(tokenImg, width / 2 - 140, priceBoxY + 22, tokenSize, tokenSize);
    } catch (error) {
      console.error('Error loading saloon token image:', error);
    }
  }

  ctx.fillStyle = lightGold;
  ctx.font = 'bold 48px Nunito-Bold';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
  ctx.shadowBlur = 10;
  ctx.fillText(`${item.price.toLocaleString()}`, width / 2 + 5, priceBoxY + 58);
  ctx.shadowBlur = 0;

  ctx.font = '18px Nunito-SemiBold';
  ctx.fillStyle = '#999';
  ctx.fillText('Saloon Tokens', width / 2, priceBoxY + 85);

  if (userTokens < item.price) {
    const crossEmoji = await loadEmojiImage('CROSS');
    
    ctx.fillStyle = 'rgba(231, 76, 60, 0.15)';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 50px Nunito-Bold';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 15;
    
    if (crossEmoji) {
      const emojiSize = 56;
      ctx.drawImage(crossEmoji, width / 2 - 280, height / 2 - 35, emojiSize, emojiSize);
      ctx.fillText('TOKENS INSUFICIENTES', width / 2 + 10, height / 2);
    } else {
      ctx.fillText('❌ TOKENS INSUFICIENTES', width / 2, height / 2);
    }
    ctx.shadowBlur = 0;
  }

  return canvas.toBuffer('image/png');
}
