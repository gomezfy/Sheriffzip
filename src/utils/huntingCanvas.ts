import { createCanvas, loadImage } from "@napi-rs/canvas";
import path from "path";
import { canvasCache } from "./canvasCache";

export interface HuntResult {
  success: boolean;
  animal?: {
    name: string;
    emoji: string;
    rarity: string;
    rarityColor: string;
  };
  rewards?: {
    meat: { id: string; name: string; amount: number };
    pelt?: { id: string; name: string; amount: number };
    feather?: { id: string; name: string; amount: number };
  };
  experience: number;
  shotAccuracy: number;
  attemptsRemaining?: number;
  maxAttempts?: number;
}

// Helper function to get pelt image path
function getPeltImagePath(peltId: string): string | null {
  const peltImages: { [key: string]: string } = {
    rabbit_pelt: "rabbit_pelt.png",
    deer_pelt: "deer_pelt.png",
    wolf_pelt: "wolf_pelt.png",
    bison_pelt: "bison_pelt.png",
    bear_pelt: "bear_pelt.png",
  };

  const fileName = peltImages[peltId];
  if (!fileName) return null;

  return path.join(process.cwd(), "assets", "custom-emojis", "pelts", fileName);
}

export async function createHuntingCanvas(
  result: HuntResult,
  userName: string,
): Promise<Buffer> {
  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background gradient (wilderness theme)
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, "#1a4d2e");
  bgGradient.addColorStop(0.5, "#2d5a3d");
  bgGradient.addColorStop(1, "#1f3a2c");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Add forest texture (darker overlay with trees pattern)
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 10, y + 40);
    ctx.lineTo(x + 10, y + 40);
    ctx.closePath();
    ctx.fill();
  }

  // Header section
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, width, 100);

  // Title with western style
  ctx.fillStyle = "#d4af37";
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 10;
  ctx.fillText("🎯 EXPEDIÇÃO DE CAÇA", width / 2, 60);
  ctx.shadowBlur = 0;

  // Hunter name
  ctx.fillStyle = "#ffffff";
  ctx.font = "24px Arial";
  ctx.fillText(`Caçador: ${userName}`, width / 2, 90);

  if (result.success && result.animal) {
    // Success section
    const centerY = 200;

    // Animal caught section
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(50, centerY - 50, width - 100, 150);
    
    // Border with rarity color
    ctx.strokeStyle = result.animal.rarityColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(50, centerY - 50, width - 100, 150);

    // Animal emoji (large)
    ctx.font = "120px Arial";
    ctx.textAlign = "center";
    ctx.fillText(result.animal.emoji, width / 2, centerY + 50);

    // Animal name and rarity
    ctx.font = "bold 36px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(result.animal.name, width / 2, centerY + 100);

    ctx.font = "24px Arial";
    ctx.fillStyle = result.animal.rarityColor;
    ctx.fillText(`★ ${result.animal.rarity} ★`, width / 2, centerY + 130);

    // Shot accuracy
    const accuracyY = centerY + 180;
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(50, accuracyY, width - 100, 40);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`🎯 Precisão do Tiro: ${result.shotAccuracy}%`, 70, accuracyY + 27);

    // Rewards section
    if (result.rewards) {
      const rewardsY = accuracyY + 60;
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(50, rewardsY, width - 100, 120);

      ctx.fillStyle = "#d4af37";
      ctx.font = "bold 28px Arial";
      ctx.textAlign = "center";
      ctx.fillText("💰 RECOMPENSAS", width / 2, rewardsY + 35);

      ctx.fillStyle = "#ffffff";
      ctx.font = "20px Arial";
      let rewardY = rewardsY + 65;

      if (result.rewards.meat) {
        ctx.textAlign = "left";
        ctx.fillText(
          `🥩 ${result.rewards.meat.name} x${result.rewards.meat.amount}`,
          80,
          rewardY,
        );
        rewardY += 30;
      }

      if (result.rewards.pelt) {
        const peltImagePath = getPeltImagePath(result.rewards.pelt.id);
        if (peltImagePath) {
          try {
            // Use cache for better performance
            const peltImage = await canvasCache.loadImageWithCache(peltImagePath);
            // Draw pelt image with higher quality (32x32 pixels)
            const emojiSize = 32;
            ctx.save();
            // Add slight shadow for better visibility
            ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
            ctx.shadowBlur = 4;
            ctx.drawImage(peltImage, 80, rewardY - emojiSize + 4, emojiSize, emojiSize);
            ctx.restore();
            ctx.fillText(
              `${result.rewards.pelt.name} x${result.rewards.pelt.amount}`,
              80 + emojiSize + 8,
              rewardY,
            );
          } catch (error) {
            // Fallback to text emoji if image fails to load
            ctx.fillText(
              `${result.animal.emoji} ${result.rewards.pelt.name} x${result.rewards.pelt.amount}`,
              80,
              rewardY,
            );
          }
        } else {
          // Fallback if no image path found
          ctx.fillText(
            `${result.animal.emoji} ${result.rewards.pelt.name} x${result.rewards.pelt.amount}`,
            80,
            rewardY,
          );
        }
        rewardY += 30;
      }

      if (result.rewards.feather) {
        ctx.fillText(
          `🪶 ${result.rewards.feather.name} x${result.rewards.feather.amount}`,
          80,
          rewardY,
        );
      }

      // XP gained
      ctx.fillStyle = "#4ade80";
      ctx.font = "22px Arial";
      ctx.textAlign = "right";
      ctx.fillText(`+${result.experience} XP`, width - 80, rewardsY + 95);
    }
  } else {
    // Failed hunt
    const centerY = 280;

    ctx.fillStyle = "rgba(139, 0, 0, 0.7)";
    ctx.fillRect(100, centerY - 80, width - 200, 160);

    ctx.strokeStyle = "#8b0000";
    ctx.lineWidth = 3;
    ctx.strokeRect(100, centerY - 80, width - 200, 160);

    // Failed emoji
    ctx.font = "100px Arial";
    ctx.textAlign = "center";
    ctx.fillText("💨", width / 2, centerY);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Arial";
    ctx.fillText("Caça Fracassada!", width / 2, centerY + 50);

    ctx.font = "20px Arial";
    ctx.fillStyle = "#ffcccc";
    ctx.fillText("O animal escapou... Tente novamente!", width / 2, centerY + 80);
  }

  // Footer
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, height - 40, width, 40);
  
  ctx.fillStyle = "#888888";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("🌲 Velho Oeste Selvagem - Sistema de Caça Profissional 🌲", width / 2, height - 15);

  // Add attempts counter if provided
  if (result.attemptsRemaining !== undefined && result.maxAttempts !== undefined) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(width - 180, 110, 160, 50);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `🎯 Tentativas: ${result.maxAttempts - result.attemptsRemaining}/${result.maxAttempts}`,
      width - 100,
      140,
    );
  }

  return canvas.toBuffer("image/png");
}

export async function createHuntingStartCanvas(
  animalName: string,
  animalEmoji: string,
  animalRarity: string,
  animalRarityColor: string,
  userName: string,
  attemptsRemaining: number,
  maxAttempts: number,
): Promise<Buffer> {
  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background gradient (wilderness theme)
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, "#1a4d2e");
  bgGradient.addColorStop(0.5, "#2d5a3d");
  bgGradient.addColorStop(1, "#1f3a2c");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Add forest texture
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 10, y + 40);
    ctx.lineTo(x + 10, y + 40);
    ctx.closePath();
    ctx.fill();
  }

  // Header section
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, width, 100);

  // Title
  ctx.fillStyle = "#d4af37";
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 10;
  ctx.fillText("🎯 EXPEDIÇÃO DE CAÇA", width / 2, 60);
  ctx.shadowBlur = 0;

  // Hunter name
  ctx.fillStyle = "#ffffff";
  ctx.font = "24px Arial";
  ctx.fillText(`Caçador: ${userName}`, width / 2, 90);

  // Animal silhouette section (center)
  const centerY = 280;

  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(100, centerY - 100, width - 200, 200);

  ctx.strokeStyle = animalRarityColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(100, centerY - 100, width - 200, 200);

  // Animal silhouette (darkened emoji)
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.font = "150px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#000000";
  ctx.fillText(animalEmoji, width / 2, centerY + 30);
  ctx.restore();

  // Question marks
  ctx.fillStyle = "#d4af37";
  ctx.font = "bold 80px Arial";
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 15;
  ctx.fillText("???", width / 2, centerY + 20);
  ctx.shadowBlur = 0;

  // Rarity hint
  ctx.font = "28px Arial";
  ctx.fillStyle = animalRarityColor;
  ctx.fillText(`★ ${animalRarity} ★`, width / 2, centerY + 80);

  // Attempts counter
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(50, height - 180, width - 100, 70);
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`🎯 TENTATIVAS: ${attemptsRemaining}/${maxAttempts}`, width / 2, height - 130);

  // Instructions
  ctx.fillStyle = "#aaaaaa";
  ctx.font = "22px Arial";
  ctx.fillText("Clique no botão 'Atirar' para tentar acertar o animal!", width / 2, height - 95);

  // Footer
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, height - 40, width, 40);
  
  ctx.fillStyle = "#888888";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    "🌲 Velho Oeste Selvagem - Sistema de Caça Profissional 🌲",
    width / 2,
    height - 15,
  );

  return canvas.toBuffer("image/png");
}
