import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  User,
  MessageFlags,
  ButtonInteraction,
  AttachmentBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { Command } from "../../types";
import { getEmoji } from "../../utils/customEmojis";
import { t, getLocale, tLocale } from "../../utils/i18n";
import { addXp } from "../../utils/xpManager";
import { isValidBetAmount } from "../../utils/security";
import { getItem, ITEMS, reduceDurability } from "../../utils/inventoryManager";
import path from "path";

interface DuelPlayer {
  user: User;
  hp: number;
  maxHp: number;
  defense: boolean;
  specialUsed: boolean;
  weaponDamage: number;
  weaponName: string;
  weaponId: string;
}

interface DuelSession {
  challenger: DuelPlayer;
  opponent: DuelPlayer;
  turn: "challenger" | "opponent";
  bet: number;
  active: boolean;
  challengerLocale: string;
  opponentLocale: string;
}

const activeDuels = new Map<string, DuelSession>();

function getBestWeapon(userId: string): { damage: number; name: string } | null {
  const weaponIds = ["escopeta", "revolver_vaqueiro", "revolver_38"];
  let bestWeapon: { damage: number; name: string } | null = null;

  for (const weaponId of weaponIds) {
    const quantity = getItem(userId, weaponId);
    if (quantity > 0) {
      const weapon = ITEMS[weaponId];
      if (weapon.damage && (!bestWeapon || weapon.damage > bestWeapon.damage)) {
        bestWeapon = {
          damage: weapon.damage,
          name: weapon.name,
        };
      }
    }
  }

  return bestWeapon;
}

function getSelectedWeapon(userId: string, weaponId?: string): { damage: number; name: string } | null {
  if (weaponId) {
    const quantity = getItem(userId, weaponId);
    if (quantity > 0) {
      const weapon = ITEMS[weaponId];
      if (weapon.damage) {
        return {
          damage: weapon.damage,
          name: weapon.name,
        };
      }
    }
    return null;
  }
  return getBestWeapon(userId);
}

function getAvailableWeapons(userId: string): Array<{ id: string; name: string; damage: number }> {
  const weaponIds = ["escopeta", "revolver_vaqueiro", "revolver_38"];
  const available: Array<{ id: string; name: string; damage: number }> = [];

  for (const weaponId of weaponIds) {
    const quantity = getItem(userId, weaponId);
    if (quantity > 0) {
      const weapon = ITEMS[weaponId];
      if (weapon.damage) {
        available.push({
          id: weaponId,
          name: weapon.name,
          damage: weapon.damage,
        });
      }
    }
  }

  return available;
}

function createPlayer(user: User, weaponId?: string): DuelPlayer | null {
  const weapon = getSelectedWeapon(user.id, weaponId);
  
  if (!weapon) {
    return null;
  }

  return {
    user,
    hp: 100,
    maxHp: 100,
    defense: false,
    specialUsed: false,
    weaponDamage: weapon.damage,
    weaponName: weapon.name,
    weaponId: weaponId || "",
  };
}

function calculateDamage(
  attacker: DuelPlayer,
  defender: DuelPlayer,
  isSpecial: boolean,
): number {
  const weaponMultiplier = attacker.weaponDamage / 50;
  
  const baseDamage = isSpecial
    ? Math.floor((Math.random() * 21 + 25) * weaponMultiplier)
    : Math.floor((Math.random() * 16 + 10) * weaponMultiplier);

  if (defender.defense) {
    return Math.floor(baseDamage * 0.4);
  }

  return baseDamage;
}

function createDuelEmbed(session: DuelSession, message: string): EmbedBuilder {
  const currentPlayer =
    session.turn === "challenger" ? session.challenger : session.opponent;
  const locale =
    session.turn === "challenger"
      ? session.challengerLocale
      : session.opponentLocale;

  const embed = new EmbedBuilder()
    .setTitle(
      `${getEmoji("revolver")} ${tLocale(locale, "duel_title")} ${getEmoji("revolver")}`,
    )
    .setDescription(message)
    .addFields(
      {
        name: `${session.challenger.user.username}`,
        value: `♥️ ${tLocale(locale, "duel_hp", { hp: session.challenger.hp, maxHp: session.challenger.maxHp })}\n${createHealthBar(session.challenger)}`,
        inline: true,
      },
      {
        name: tLocale(locale, "duel_vs"),
        value: `${getEmoji("cowboys")}`,
        inline: true,
      },
      {
        name: `${session.opponent.user.username}`,
        value: `♥️ ${tLocale(locale, "duel_hp", { hp: session.opponent.hp, maxHp: session.opponent.maxHp })}\n${createHealthBar(session.opponent)}`,
        inline: true,
      },
      {
        name: tLocale(locale, "duel_current_turn"),
        value: `${getEmoji("cowboy")} **${currentPlayer.user.username}**`,
        inline: false,
      },
    )
    .setColor(0xd4af37)
    .setFooter({
      text: tLocale(locale, "duel_bet_info", { amount: session.bet }).replace(
        /\n/,
        "",
      ),
    })
    .setTimestamp();

  return embed;
}

function createHealthBar(player: DuelPlayer): string {
  const percentage = (player.hp / player.maxHp) * 100;
  const filledBars = Math.floor(percentage / 10);
  const emptyBars = 10 - filledBars;

  let color = "🟢";
  if (percentage < 30) color = "🔴";
  else if (percentage < 60) color = "🟡";

  return `${color} ${"█".repeat(filledBars)}${"░".repeat(emptyBars)} ${Math.round(percentage)}%`;
}

function createActionButtons(
  player: DuelPlayer,
  locale: string,
): ActionRowBuilder<ButtonBuilder> {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("duel_attack")
      .setLabel(tLocale(locale, "duel_quick_draw"))
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("duel_defend")
      .setLabel(tLocale(locale, "duel_take_cover"))
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("duel_special")
      .setLabel(tLocale(locale, "duel_headshot"))
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(player.specialUsed),
  );

  return row;
}

interface TurnResult {
  damage: number;
  wasDefending: boolean;
  weaponBroken?: boolean;
  brokenWeaponName?: string;
  attackerUserId?: string;
}

async function processTurn(
  session: DuelSession,
  action: "attack" | "defend" | "special",
): Promise<TurnResult> {
  const attacker =
    session.turn === "challenger" ? session.challenger : session.opponent;
  const defender =
    session.turn === "challenger" ? session.opponent : session.challenger;

  const wasDefending = defender.defense;
  let damage = 0;
  let weaponBroken = false;
  let brokenWeaponName = "";

  if (action === "defend") {
    attacker.defense = true;
  } else {
    if (action === "special") {
      attacker.specialUsed = true;
      damage = calculateDamage(attacker, defender, true);
      defender.hp = Math.max(0, defender.hp - damage);
    } else {
      damage = calculateDamage(attacker, defender, false);
      defender.hp = Math.max(0, defender.hp - damage);
    }

    const durabilityResult = await reduceDurability(attacker.user.id, attacker.weaponId);
    if (durabilityResult.broken) {
      weaponBroken = true;
      brokenWeaponName = attacker.weaponName;
    }

    defender.defense = false;
    attacker.defense = false;
  }

  session.turn = session.turn === "challenger" ? "opponent" : "challenger";

  return { damage, wasDefending, weaponBroken, brokenWeaponName, attackerUserId: attacker.user.id };
}

function getActionMessage(
  session: DuelSession,
  action: "attack" | "defend" | "special",
  result: TurnResult,
  attackerName: string,
  defenderName: string,
  overrideLocale?: string,
): string {
  const locale =
    overrideLocale ||
    (session.turn === "challenger"
      ? session.challengerLocale
      : session.opponentLocale);

  if (action === "defend") {
    return `${getEmoji("mute")} ${tLocale(locale, "duel_action_defend", { user: attackerName })}`;
  } else if (action === "special") {
    if (result.wasDefending) {
      return `${getEmoji("lightning")} ${tLocale(locale, "duel_action_special_cover", { user: attackerName, target: defenderName })}\n💥 ${tLocale(locale, "duel_dealt_damage_reduced", { damage: result.damage })}`;
    } else {
      return `${getEmoji("lightning")} ${tLocale(locale, "duel_action_special", { user: attackerName })}\n💥 ${tLocale(locale, "duel_dealt_damage", { damage: result.damage })}`;
    }
  } else {
    if (result.wasDefending) {
      return `${getEmoji("revolver")} ${tLocale(locale, "duel_action_attack_cover", { user: attackerName, target: defenderName })}\n🎯 ${tLocale(locale, "duel_dealt_damage_reduced", { damage: result.damage })}`;
    } else {
      return `${getEmoji("revolver")} ${tLocale(locale, "duel_action_attack", { user: attackerName })}\n🎯 ${tLocale(locale, "duel_dealt_damage", { damage: result.damage })}`;
    }
  }
}

async function checkWinner(session: DuelSession): Promise<DuelPlayer | null> {
  if (session.challenger.hp <= 0) {
    return session.opponent;
  }
  if (session.opponent.hp <= 0) {
    return session.challenger;
  }
  return null;
}

export const data = new SlashCommandBuilder()
  .setName("duel")
  .setDescription("🤠 Challenge another cowboy to a duel!")
  .setDescriptionLocalizations({
    "pt-BR": "🤠 Desafie outro cowboy para um duelo!",
  })
  .addUserOption((option) =>
    option
      .setName("opponent")
      .setDescription("The cowboy you want to duel")
      .setDescriptionLocalizations({
        "pt-BR": "O cowboy que você quer duelar",
      })
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName("weapon")
      .setDescription("Choose your weapon for the duel")
      .setDescriptionLocalizations({
        "pt-BR": "Escolha sua arma para o duelo",
      })
      .setRequired(true)
      .addChoices(
        { name: "🔫 Escopeta (85 dano)", value: "escopeta" },
        { name: "🔫 Revólver de Vaqueiro (65 dano)", value: "revolver_vaqueiro" },
        { name: "🔫 Revólver Calibre 38 (55 dano)", value: "revolver_38" },
      ),
  )
  .addIntegerOption((option) =>
    option
      .setName("bet")
      .setDescription("Amount of Silver Coins to bet (winner takes all)")
      .setDescriptionLocalizations({
        "pt-BR":
          "Quantidade de Moedas de Prata para apostar (vencedor leva tudo)",
      })
      .setRequired(false)
      .setMinValue(0)
      .setMaxValue(10000000),
  );

export async function execute(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const opponent = interaction.options.getUser("opponent", true);
  const bet = interaction.options.getInteger("bet") || 0;
  const selectedWeapon = interaction.options.getString("weapon", true);

  if (opponent.id === interaction.user.id) {
    await interaction.reply({
      content: `${getEmoji("warning")} ${t(interaction, "duel_cant_self")}`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (opponent.bot) {
    await interaction.reply({
      content: `${getEmoji("warning")} ${t(interaction, "duel_cant_bot")}`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const challengerWeapon = getSelectedWeapon(interaction.user.id, selectedWeapon);
  if (!challengerWeapon) {
    await interaction.reply({
      content: `${getEmoji("warning")} Você não possui ${ITEMS[selectedWeapon]?.name} no inventário! Visite a armaria com \`/armaria\` para comprar.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const opponentWeapons = getAvailableWeapons(opponent.id);
  if (opponentWeapons.length === 0) {
    await interaction.reply({
      content: `${getEmoji("warning")} ${opponent.username} não possui nenhuma arma no inventário e não pode duelar!`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // Security: Validate bet amount
  if (bet > 0 && !isValidBetAmount(bet)) {
    await interaction.reply({
      content: "❌ Invalid bet amount! Maximum bet is 10,000,000 silver coins.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const duelId = `${interaction.user.id}-${opponent.id}`;
  const reverseDuelId = `${opponent.id}-${interaction.user.id}`;

  if (activeDuels.has(duelId) || activeDuels.has(reverseDuelId)) {
    await interaction.reply({
      content: `${getEmoji("warning")} ${t(interaction, "duel_active_already")}`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const acceptButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("duel_accept")
      .setLabel(t(interaction, "duel_accept_btn"))
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("duel_decline")
      .setLabel(t(interaction, "duel_decline_btn"))
      .setStyle(ButtonStyle.Secondary),
  );

  const betInfo =
    bet > 0
      ? t(interaction, "duel_bet_info", { amount: bet })
      : t(interaction, "duel_no_bet");

  const challengeEmbed = new EmbedBuilder()
    .setTitle(
      `${getEmoji("cowboys")} ${t(interaction, "duel_challenge_title")} ${getEmoji("cowboys")}`,
    )
    .setDescription(
      t(interaction, "duel_challenge_desc", {
        challenger: interaction.user.username,
        opponent: opponent.username,
        bet_info: betInfo,
      }) + `\n\n**Arma do desafiante:**\n🔫 ${interaction.user.username}: ${challengerWeapon.name} (${challengerWeapon.damage} dano)`,
    )
    .setImage("https://i.postimg.cc/R0rrbtT8/IMG-3257.png")
    .setColor(0xd4af37)
    .setTimestamp();

  const response = await interaction.reply({
    content: `${opponent}`,
    embeds: [challengeEmbed],
    components: [acceptButton],
  });

  try {
    const confirmation = await response.awaitMessageComponent({
      filter: (i) => i.user.id === opponent.id,
      componentType: ComponentType.Button,
      time: 60000,
    });

    if (confirmation.customId === "duel_decline") {
      await confirmation.update({
        content: `${getEmoji("cancel")} ${t(confirmation, "duel_declined", { user: opponent.username })}`,
        embeds: [],
        components: [],
      });
      return;
    }

    const weaponSelectMenu = new StringSelectMenuBuilder()
      .setCustomId("weapon_select")
      .setPlaceholder("Escolha sua arma para o duelo")
      .addOptions(
        opponentWeapons.map(weapon =>
          new StringSelectMenuOptionBuilder()
            .setLabel(`${weapon.name} (${weapon.damage} dano)`)
            .setDescription(`Dano: ${weapon.damage}`)
            .setValue(weapon.id)
            .setEmoji("🔫")
        )
      );

    const weaponRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(weaponSelectMenu);

    await confirmation.update({
      content: `${getEmoji("check")} ${opponent.username}, escolha sua arma para o duelo:`,
      embeds: [],
      components: [weaponRow],
    });

    const weaponSelection = await confirmation.message.awaitMessageComponent({
      filter: (i) => i.user.id === opponent.id,
      componentType: ComponentType.StringSelect,
      time: 60000,
    });

    const opponentWeaponId = weaponSelection.values[0];

    const challengerPlayer = createPlayer(interaction.user, selectedWeapon);
    const opponentPlayer = createPlayer(opponent, opponentWeaponId);

    if (!challengerPlayer || !opponentPlayer) {
      await weaponSelection.update({
        content: `${getEmoji("warning")} Erro ao iniciar duelo: um dos jogadores não possui arma.`,
        embeds: [],
        components: [],
      });
      return;
    }

    const session: DuelSession = {
      challenger: challengerPlayer,
      opponent: opponentPlayer,
      turn: Math.random() < 0.5 ? "challenger" : "opponent",
      bet,
      active: true,
      challengerLocale: getLocale(interaction),
      opponentLocale: getLocale(weaponSelection),
    };

    activeDuels.set(duelId, session);

    const currentLocale =
      session.turn === "challenger"
        ? session.challengerLocale
        : session.opponentLocale;
    const startMessage =
      `${getEmoji("check")} ${tLocale(currentLocale, "duel_accepted")}\n\n` +
      `**Armas:**\n🔫 ${interaction.user.username}: ${challengerPlayer.weaponName} (${challengerPlayer.weaponDamage} dano)\n🔫 ${opponent.username}: ${opponentPlayer.weaponName} (${opponentPlayer.weaponDamage} dano)\n\n` +
      `${getEmoji("cowboy_horse")} ${tLocale(currentLocale, "duel_first_turn", { user: session.turn === "challenger" ? interaction.user.username : opponent.username })}`;

    await weaponSelection.update({
      content: "",
      embeds: [createDuelEmbed(session, startMessage)],
      components: [
        createActionButtons(
          session.turn === "challenger" ? session.challenger : session.opponent,
          session.turn === "challenger"
            ? session.challengerLocale
            : session.opponentLocale,
        ),
      ],
      attachments: [],
    });

    let currentMessage = await weaponSelection.fetchReply();

    while (session.active) {
      const currentPlayer =
        session.turn === "challenger" ? session.challenger : session.opponent;

      try {
        const actionInteraction = await currentMessage.awaitMessageComponent({
          filter: (i) => {
            if (i.user.id !== currentPlayer.user.id) {
              const userLocale = getLocale(i);
              i.reply({
                content: `${getEmoji("warning")} ${tLocale(userLocale, "duel_participants_only")}`,
                flags: MessageFlags.Ephemeral,
              }).catch(() => {});
              return false;
            }
            return true;
          },
          componentType: ComponentType.Button,
          time: 60000,
        });

        const action = actionInteraction.customId.replace("duel_", "") as
          | "attack"
          | "defend"
          | "special";
        const previousAttacker =
          session.turn === "challenger" ? session.challenger : session.opponent;
        const previousDefender =
          session.turn === "challenger" ? session.opponent : session.challenger;

        const turnResult = await processTurn(session, action);

        const winner = await checkWinner(session);

        if (winner) {
          session.active = false;
          activeDuels.delete(duelId);

          const loser =
            winner === session.challenger
              ? session.opponent
              : session.challenger;
          const winnerLocale =
            winner === session.challenger
              ? session.challengerLocale
              : session.opponentLocale;

          const winnerXpResult = addXp(winner.user.id, 50, true);
          const loserXpResult = addXp(loser.user.id, 15, true);

          let xpMessage = "";
          if (winnerXpResult.granted && loserXpResult.granted) {
            xpMessage = `\n\n⭐ **${tLocale(winnerLocale, "duel_xp_gained")}:**`;
            xpMessage += `\n${tLocale(winnerLocale, "duel_xp_amount", { user: winner.user.username, amount: "50" })}`;
            if (winnerXpResult.leveledUp) {
              xpMessage += ` 🎉 (${tLocale(winnerLocale, "duel_xp_levelup", { oldLevel: winnerXpResult.oldLevel, newLevel: winnerXpResult.newLevel })})`;
            }
            xpMessage += `\n${tLocale(winnerLocale, "duel_xp_amount", { user: loser.user.username, amount: "15" })}`;
            if (loserXpResult.leveledUp) {
              xpMessage += ` 🎉 (${tLocale(winnerLocale, "duel_xp_levelup", { oldLevel: loserXpResult.oldLevel, newLevel: loserXpResult.newLevel })})`;
            }
          }
          let actionMessage = getActionMessage(
            session,
            action,
            turnResult,
            previousAttacker.user.username,
            previousDefender.user.username,
            winnerLocale,
          );
          
          if (turnResult.weaponBroken) {
            const brokenMessage = `\n${tLocale(winnerLocale, "duel_weapon_broken", { 
              weapon: turnResult.brokenWeaponName, 
              user: previousAttacker.user.username 
            })}`;
            actionMessage += brokenMessage;
          }
          
          const winnerMessage =
            `${actionMessage}\n\n${getEmoji("star")} ${tLocale(winnerLocale, "duel_winner", { user: winner.user.username })}\n\n` +
            (bet > 0
              ? `${getEmoji("moneybag")} ${tLocale(winnerLocale, "duel_won_coins", { amount: bet })}`
              : "") +
            xpMessage;

          const winnerEmbed = new EmbedBuilder()
            .setTitle(
              `${getEmoji("trophy")} ${tLocale(winnerLocale, "duel_complete")} ${getEmoji("trophy")}`,
            )
            .setDescription(winnerMessage)
            .setColor(0xffd700)
            .setTimestamp();

          await actionInteraction.update({
            embeds: [winnerEmbed],
            components: [],
          });
          return;
        }

        let actionMessage = getActionMessage(
          session,
          action,
          turnResult,
          previousAttacker.user.username,
          previousDefender.user.username,
        );
        
        if (turnResult.weaponBroken) {
          const attackerLocale = turnResult.attackerUserId === interaction.user.id 
            ? session.challengerLocale 
            : session.opponentLocale;
          const brokenMessage = `\n${tLocale(attackerLocale, "duel_weapon_broken", { 
            weapon: turnResult.brokenWeaponName, 
            user: previousAttacker.user.username 
          })}`;
          actionMessage += brokenMessage;
        }
        
        await actionInteraction.update({
          embeds: [createDuelEmbed(session, actionMessage)],
          components: [
            createActionButtons(
              session.turn === "challenger"
                ? session.challenger
                : session.opponent,
              session.turn === "challenger"
                ? session.challengerLocale
                : session.opponentLocale,
            ),
          ],
        });

        currentMessage = await actionInteraction.fetchReply();
      } catch (error) {
        session.active = false;
        activeDuels.delete(duelId);

        const timedOutLocale =
          currentPlayer === session.challenger
            ? session.challengerLocale
            : session.opponentLocale;
        try {
          await currentMessage.edit({
            content: `${getEmoji("timer")} ${tLocale(timedOutLocale, "duel_timeout", { user: currentPlayer.user.username })}`,
            embeds: [],
            components: [],
          });
        } catch (editError) {
          console.error("Failed to edit duel timeout message:", editError);
        }
        return;
      }
    }
  } catch (error) {
    try {
      await interaction.editReply({
        content: `${getEmoji("timer")} ${t(interaction, "duel_challenge_expired")}`,
        embeds: [],
        components: [],
      });
    } catch (editError) {
      console.error("Failed to edit expired duel challenge:", editError);
    }
  }
}

export const cooldown = 30;

const command: Command = { data, execute, cooldown };
export default command;
