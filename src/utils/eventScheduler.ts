import cron from "node-cron";
import { Client, TextChannel } from "discord.js";
import {
  startMiningEvent,
  checkAndEndEvent,
  isSunday,
  getCurrentEvent,
} from "./eventManager";
import logger from "./consoleLogger";

let eventStartScheduler: any = null;
let eventCheckInterval: NodeJS.Timeout | null = null;

/**
 * Start event scheduler
 * Events start every Sunday at 23:59
 */
export async function startEventScheduler(client: Client, notificationChannelId?: string): Promise<void> {
  if (eventStartScheduler) {
    logger.warn("Event scheduler already running");
    return;
  }

  // Schedule events to start every Sunday at 23:59 (America/Sao_Paulo timezone)
  const cronExpression = "59 23 * * 0"; // Every Sunday at 23:59
  
  logger.info(`Starting event scheduler: ${cronExpression} (America/Sao_Paulo)`);

  eventStartScheduler = cron.schedule(
    cronExpression,
    async () => {
      try {
        logger.info("🏆 Event scheduler triggered - Checking for mining event start");
        
        // Check if there's already an active event
        const existingEvent = getCurrentEvent();
        if (existingEvent && existingEvent.active) {
          logger.warn("⚠️  CRON SKIP: Active event already exists, not starting new event");
          logger.warn(`   Existing event ID: ${existingEvent.id}`);
          logger.warn(`   Started: ${new Date(existingEvent.startTime).toISOString()}`);
          logger.warn(`   This may indicate a stuck payout or manual event - check event status`);
          return;
        }
        
        logger.info("🏆 Starting new mining event");
        const event = await startMiningEvent(client, notificationChannelId);
        logger.success(`Mining event started! ID: ${event.id}`);

        // Send notification if channel is set
        if (notificationChannelId) {
          try {
            const channel = await client.channels.fetch(notificationChannelId);
            if (channel instanceof TextChannel) {
              await channel.send({
                content: "🏆 **EVENTO DE MINERAÇÃO INICIADO!**\n\n⛏️ O evento de 48h começou! (Domingo 23:59 até Terça 23:59)\n💰 Mine ouro e ganhe pontos: **1 ouro = 40 pontos**\n🥇 Top 10 ganham prêmios incríveis!\n\n📊 Use `/evento` para ver o ranking!",
              });
            }
          } catch (error) {
            logger.error("Failed to send event start notification:", error);
          }
        }
      } catch (error) {
        logger.error("Error starting mining event:", error);
      }
    },
    {
      timezone: "America/Sao_Paulo",
    },
  );

  // Check every minute if event should end
  eventCheckInterval = setInterval(async () => {
    try {
      const ended = await checkAndEndEvent(client);
      if (ended) {
        logger.success("🏆 Mining event ended and rewards distributed!");
      }
    } catch (error) {
      logger.error("Error checking/ending event:", error);
    }
  }, 60 * 1000); // Every 1 minute

  logger.success("Event scheduler started successfully (runs every Sunday at 23:59 America/Sao_Paulo)");

  // Check if it's Sunday and no event is active - start one immediately
  // This ensures events start even if bot restarts during Sunday
  const now = new Date();
  const currentEvent = getCurrentEvent();
  
  if (isSunday() && (!currentEvent || !currentEvent.active)) {
    // Check if we're still within the 48h window from midnight
    const sundayMidnight = new Date(now);
    sundayMidnight.setHours(0, 0, 0, 0);
    const hoursSinceMidnight = (now.getTime() - sundayMidnight.getTime()) / (1000 * 60 * 60);
    
    // Only start if less than 48 hours have passed since Sunday midnight
    if (hoursSinceMidnight < 48) {
      logger.info("It's Sunday and no active event - starting event immediately");
      try {
        const event = await startMiningEvent(client, notificationChannelId);
        logger.success(`Mining event started immediately! ID: ${event.id}`);
        
        // Send notification if channel is set
        if (notificationChannelId) {
          try {
            const channel = await client.channels.fetch(notificationChannelId);
            if (channel instanceof TextChannel) {
              await channel.send({
                content: "🏆 **EVENTO DE MINERAÇÃO INICIADO!**\n\n⛏️ O evento de 48h começou! (Domingo 23:59 até Terça 23:59)\n💰 Mine ouro e ganhe pontos: **1 ouro = 40 pontos**\n🥇 Top 10 ganham prêmios incríveis!\n\n📊 Use `/evento` para ver o ranking!",
              });
            }
          } catch (error) {
            logger.error("Failed to send immediate event notification:", error);
          }
        }
      } catch (error) {
        logger.error("Error starting immediate event:", error);
      }
    }
  }
}

/**
 * Stop event scheduler
 */
export function stopEventScheduler(): void {
  if (eventStartScheduler) {
    eventStartScheduler.stop();
    eventStartScheduler = null;
    logger.info("Event start scheduler stopped");
  }

  if (eventCheckInterval) {
    clearInterval(eventCheckInterval);
    eventCheckInterval = null;
    logger.info("Event check interval stopped");
  }
}

/**
 * Manual start event (for testing or admin commands)
 */
export async function manualStartEvent(client: Client, notificationChannelId?: string): Promise<void> {
  const event = await startMiningEvent(client, notificationChannelId);
  logger.success(`Mining event manually started! ID: ${event.id}`);
}
