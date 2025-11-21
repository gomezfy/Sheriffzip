import { startMiningEvent } from "../src/utils/eventManager";

async function startEventNow() {
  try {
    console.log("🏆 Iniciando evento Corrida do Ouro manualmente...");
    
    const event = await startMiningEvent(undefined, undefined, "Corrida do Ouro");
    
    console.log("✅ Evento iniciado com sucesso!");
    console.log(`📅 ID: ${event.id}`);
    console.log(`📛 Nome: ${event.name}`);
    console.log(`⏰ Início: ${new Date(event.startTime).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
    console.log(`⏱️ Término: ${new Date(event.endTime).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
    console.log(`⛏️ Duração: 48 horas`);
    console.log("\n🎉 O evento está ativo! Os jogadores já podem minerar e ganhar pontos!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao iniciar evento:", error);
    process.exit(1);
  }
}

startEventNow();
