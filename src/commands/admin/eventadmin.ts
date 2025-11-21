import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { isOwner } from "../../utils/security";
import {
  startMiningEvent,
  startHuntingEvent,
  getAllActiveEvents,
  getEventsData,
  saveEventsData,
  getCurrentEvent,
  getCurrentHuntingEvent,
} from "../../utils/eventManager";
import { getEmoji } from "../../utils/customEmojis";

export default {
  data: new SlashCommandBuilder()
    .setName("eventadmin")
    .setDescription("🎮 Gerenciar eventos (apenas owner)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    
    .addSubcommand((sub) =>
      sub
        .setName("start-mining")
        .setDescription("Iniciar evento de mineração")
        .addIntegerOption((option) =>
          option
            .setName("days")
            .setDescription("Duração em dias (padrão: 2)")
            .setMinValue(1)
            .setMaxValue(30)
            .setRequired(false),
        )
        .addIntegerOption((option) =>
          option
            .setName("hours")
            .setDescription("Horas adicionais (padrão: 0)")
            .setMinValue(0)
            .setMaxValue(23)
            .setRequired(false),
        )
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Nome do evento (padrão: Corrida do Ouro)")
            .setRequired(false),
        ),
    )
    
    .addSubcommand((sub) =>
      sub
        .setName("start-hunting")
        .setDescription("Iniciar evento de caça")
        .addIntegerOption((option) =>
          option
            .setName("days")
            .setDescription("Duração em dias (padrão: 2)")
            .setMinValue(1)
            .setMaxValue(30)
            .setRequired(false),
        )
        .addIntegerOption((option) =>
          option
            .setName("hours")
            .setDescription("Horas adicionais (padrão: 0)")
            .setMinValue(0)
            .setMaxValue(23)
            .setRequired(false),
        )
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Nome do evento (padrão: Caçada do Oeste)")
            .setRequired(false),
        ),
    )
    
    .addSubcommand((sub) =>
      sub
        .setName("stop")
        .setDescription("Parar todos os eventos ativos")
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("Tipo de evento para parar")
            .addChoices(
              { name: "Todos", value: "all" },
              { name: "Mineração", value: "mining" },
              { name: "Caça", value: "hunting" },
            )
            .setRequired(false),
        ),
    )
    
    .addSubcommand((sub) =>
      sub
        .setName("status")
        .setDescription("Ver status de todos os eventos ativos"),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    // Verificar se é o owner
    if (!(await isOwner(interaction))) {
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle("🚫 Acesso Negado")
        .setDescription("Apenas o dono do bot pode usar este comando!")
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    try {
      await interaction.deferReply({ ephemeral: true });

      if (subcommand === "start-mining") {
        await handleStartMining(interaction);
      } else if (subcommand === "start-hunting") {
        await handleStartHunting(interaction);
      } else if (subcommand === "stop") {
        await handleStopEvents(interaction);
      } else if (subcommand === "status") {
        await handleStatus(interaction);
      }
    } catch (error) {
      console.error("Error in eventadmin command:", error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle("❌ Erro")
        .setDescription(`Ocorreu um erro ao executar o comando: ${error}`)
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};

async function handleStartMining(interaction: ChatInputCommandInteraction) {
  const days = interaction.options.getInteger("days") || 2;
  const hours = interaction.options.getInteger("hours") || 0;
  const name = interaction.options.getString("name") || "Corrida do Ouro";

  // Check if mining event already active
  const currentEvent = getCurrentEvent();
  if (currentEvent && currentEvent.active) {
    const embed = new EmbedBuilder()
      .setColor(0xFFA500)
      .setTitle("⚠️ Evento Já Ativo")
      .setDescription(
        `Já existe um evento de mineração ativo!\n\n` +
        `**Nome:** ${currentEvent.name}\n` +
        `**Início:** <t:${Math.floor(currentEvent.startTime / 1000)}:F>\n` +
        `**Término:** <t:${Math.floor(currentEvent.endTime / 1000)}:F>\n\n` +
        `Use \`/eventadmin stop type:mineração\` para parar o evento atual antes de iniciar um novo.`
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    return;
  }

  // Calculate duration in milliseconds
  const durationMs = (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000);
  const endTime = Date.now() + durationMs;

  // Start the event
  const event = await startMiningEvent(interaction.client, undefined, name);

  // Update end time if custom duration
  if (days !== 2 || hours !== 0) {
    const data = getEventsData();
    if (data.currentEvent) {
      data.currentEvent.endTime = endTime;
      saveEventsData(data);
    }
  }

  const embed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle("⛏️ Evento de Mineração Iniciado!")
    .setDescription(
      `O evento de mineração foi iniciado com sucesso!\n\n` +
      `**Nome:** ${name}\n` +
      `**Duração:** ${days} dia(s) e ${hours} hora(s)\n` +
      `**Início:** <t:${Math.floor(event.startTime / 1000)}:F>\n` +
      `**Término:** <t:${Math.floor(endTime / 1000)}:F>\n\n` +
      `Os jogadores já podem usar \`/mine\` para participar!`
    )
    .addFields(
      {
        name: "🏆 Sistema de Pontos",
        value: "1 ouro = 40 pontos",
        inline: true,
      },
      {
        name: "🎁 Prêmios",
        value: "Top 10 jogadores",
        inline: true,
      }
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleStartHunting(interaction: ChatInputCommandInteraction) {
  const days = interaction.options.getInteger("days") || 2;
  const hours = interaction.options.getInteger("hours") || 0;
  const name = interaction.options.getString("name") || "Caçada do Oeste";

  // Check if hunting event already active
  const currentEvent = getCurrentHuntingEvent();
  if (currentEvent && currentEvent.active) {
    const embed = new EmbedBuilder()
      .setColor(0xFFA500)
      .setTitle("⚠️ Evento Já Ativo")
      .setDescription(
        `Já existe um evento de caça ativo!\n\n` +
        `**Nome:** ${currentEvent.name}\n` +
        `**Início:** <t:${Math.floor(currentEvent.startTime / 1000)}:F>\n` +
        `**Término:** <t:${Math.floor(currentEvent.endTime / 1000)}:F>\n\n` +
        `Use \`/eventadmin stop type:caça\` para parar o evento atual antes de iniciar um novo.`
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    return;
  }

  // Calculate duration in milliseconds
  const durationMs = (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000);

  // Start the event
  const event = await startHuntingEvent(
    interaction.client,
    undefined,
    name,
    durationMs
  );

  const embed = new EmbedBuilder()
    .setColor(0x8B4513)
    .setTitle("🎯 Evento de Caça Iniciado!")
    .setDescription(
      `O evento de caça foi iniciado com sucesso!\n\n` +
      `**Nome:** ${name}\n` +
      `**Duração:** ${days} dia(s) e ${hours} hora(s)\n` +
      `**Início:** <t:${Math.floor(event.startTime / 1000)}:F>\n` +
      `**Término:** <t:${Math.floor(event.endTime / 1000)}:F>\n\n` +
      `Os jogadores já podem usar \`/hunt\` para participar!`
    )
    .addFields(
      {
        name: "🏆 Sistema de Pontos",
        value: "1 pele = 50 pontos\n1 carne = 20 pontos",
        inline: true,
      },
      {
        name: "🎁 Prêmios",
        value: "Top 10 jogadores",
        inline: true,
      }
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleStopEvents(interaction: ChatInputCommandInteraction) {
  const type = interaction.options.getString("type") || "all";
  
  const data = getEventsData();
  let stoppedCount = 0;
  const stoppedEvents: string[] = [];

  if (type === "all" || type === "mining") {
    if (data.currentEvent && data.currentEvent.active) {
      data.currentEvent.active = false;
      stoppedCount++;
      stoppedEvents.push(`⛏️ ${data.currentEvent.name} (Mineração)`);
    }
  }

  if (type === "all" || type === "hunting") {
    if (data.activeEvents) {
      data.activeEvents.forEach(event => {
        if (event.type === "hunting" && event.active) {
          event.active = false;
          stoppedCount++;
          stoppedEvents.push(`🎯 ${event.name} (Caça)`);
        }
      });
    }
  }

  saveEventsData(data);

  const embed = new EmbedBuilder()
    .setColor(stoppedCount > 0 ? 0x00FF00 : 0xFFA500)
    .setTitle(stoppedCount > 0 ? "✅ Eventos Parados" : "ℹ️ Nenhum Evento Ativo")
    .setDescription(
      stoppedCount > 0
        ? `**${stoppedCount} evento(s) foram parados:**\n\n${stoppedEvents.join("\n")}`
        : "Não há eventos ativos para parar."
    )
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleStatus(interaction: ChatInputCommandInteraction) {
  const activeEvents = getAllActiveEvents();

  if (activeEvents.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(0x808080)
      .setTitle("📊 Status dos Eventos")
      .setDescription("Nenhum evento ativo no momento.")
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0x00FF00)
    .setTitle("📊 Status dos Eventos")
    .setDescription(`**${activeEvents.length} evento(s) ativo(s):**`)
    .setTimestamp();

  activeEvents.forEach((event, index) => {
    const participantCount = Object.keys(event.participants).length;
    const timeRemaining = event.endTime - Date.now();
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    const icon = event.type === "mining" ? "⛏️" : "🎯";
    const eventType = event.type === "mining" ? "Mineração" : "Caça";

    embed.addFields({
      name: `${icon} ${event.name} (${eventType})`,
      value:
        `**ID:** \`${event.id}\`\n` +
        `**Início:** <t:${Math.floor(event.startTime / 1000)}:R>\n` +
        `**Término:** <t:${Math.floor(event.endTime / 1000)}:R>\n` +
        `**Tempo restante:** ${hoursRemaining}h ${minutesRemaining}m\n` +
        `**Participantes:** ${participantCount}\n` +
        `**Fase:** ${event.phase + 1}/7`,
      inline: false,
    });
  });

  await interaction.editReply({ embeds: [embed] });
}
