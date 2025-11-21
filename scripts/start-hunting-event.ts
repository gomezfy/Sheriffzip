import { Client, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
import { startHuntingEvent } from "../src/utils/eventManager";

dotenv.config();

/**
 * Script to manually start a hunting event
 * Usage: ts-node -r tsconfig-paths/register scripts/start-hunting-event.ts
 */

async function main() {
  console.log("🎯 Starting hunting event manually...");

  // Calculate event duration
  // Start: Today at 02:00 (Brazil time)
  // End: Friday at 22:00 (Brazil time)
  
  const now = new Date();
  const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  
  console.log(`Current Brazil time: ${brazilTime.toLocaleString('pt-BR')}`);
  
  // Set start time to today at 02:00
  const startTime = new Date(brazilTime);
  startTime.setHours(2, 0, 0, 0);
  
  // If it's already past 02:00 today, start now
  if (brazilTime.getTime() > startTime.getTime()) {
    console.log("⚠️  Already past 02:00 AM, starting event NOW");
    startTime.setTime(Date.now());
  }
  
  // Set end time to Friday at 23:00
  const endTime = new Date(startTime);
  const daysUntilFriday = (5 - startTime.getDay() + 7) % 7;
  endTime.setDate(startTime.getDate() + daysUntilFriday);
  endTime.setHours(23, 0, 0, 0);
  
  // If Friday is today and we're past 23:00, set to next Friday
  if (endTime.getTime() <= startTime.getTime()) {
    endTime.setDate(endTime.getDate() + 7);
  }
  
  const duration = endTime.getTime() - startTime.getTime();
  const durationHours = Math.floor(duration / (1000 * 60 * 60));
  
  console.log(`📅 Start time: ${startTime.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
  console.log(`📅 End time: ${endTime.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
  console.log(`⏱️  Duration: ${durationHours} hours`);

  // Create a temporary client just to start the event
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
    ],
  });

  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.error("❌ DISCORD_TOKEN not found in environment");
    process.exit(1);
  }

  try {
    await client.login(token);
    console.log("✅ Bot connected");

    // Start the hunting event with custom duration
    const event = await startHuntingEvent(
      client,
      undefined, // No notification channel
      "Caçada do Oeste", // Event name
      duration // Custom duration in milliseconds
    );

    console.log("✅ Hunting event started successfully!");
    console.log(`   Event ID: ${event.id}`);
    console.log(`   Event Name: ${event.name}`);
    console.log(`   Start: ${new Date(event.startTime).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
    console.log(`   End: ${new Date(event.endTime).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
    console.log(`   Duration: ${durationHours}h`);

    await client.destroy();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error starting hunting event:", error);
    process.exit(1);
  }
}

main();
