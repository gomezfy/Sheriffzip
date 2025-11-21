"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cooldown = exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const customEmojis_1 = require("../../utils/customEmojis");
const i18n_1 = require("../../utils/i18n");
const xpManager_1 = require("../../utils/xpManager");
const security_1 = require("../../utils/security");
const inventoryManager_1 = require("../../utils/inventoryManager");
const activeDuels = new Map();
function getBestWeapon(userId) {
    const weaponIds = ["escopeta", "revolver_vaqueiro", "revolver_38"];
    let bestWeapon = null;
    for (const weaponId of weaponIds) {
        const quantity = (0, inventoryManager_1.getItem)(userId, weaponId);
        if (quantity > 0) {
            const weapon = inventoryManager_1.ITEMS[weaponId];
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
function getSelectedWeapon(userId, weaponId) {
    if (weaponId) {
        const quantity = (0, inventoryManager_1.getItem)(userId, weaponId);
        if (quantity > 0) {
            const weapon = inventoryManager_1.ITEMS[weaponId];
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
function getAvailableWeapons(userId) {
    const weaponIds = ["escopeta", "revolver_vaqueiro", "revolver_38"];
    const available = [];
    for (const weaponId of weaponIds) {
        const quantity = (0, inventoryManager_1.getItem)(userId, weaponId);
        if (quantity > 0) {
            const weapon = inventoryManager_1.ITEMS[weaponId];
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
function createPlayer(user, weaponId) {
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
function calculateDamage(attacker, defender, isSpecial) {
    const weaponMultiplier = attacker.weaponDamage / 50;
    const baseDamage = isSpecial
        ? Math.floor((Math.random() * 21 + 25) * weaponMultiplier)
        : Math.floor((Math.random() * 16 + 10) * weaponMultiplier);
    if (defender.defense) {
        return Math.floor(baseDamage * 0.4);
    }
    return baseDamage;
}
function createDuelEmbed(session, message) {
    const currentPlayer = session.turn === "challenger" ? session.challenger : session.opponent;
    const locale = session.turn === "challenger"
        ? session.challengerLocale
        : session.opponentLocale;
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle(`${(0, customEmojis_1.getEmoji)("revolver")} ${(0, i18n_1.tLocale)(locale, "duel_title")} ${(0, customEmojis_1.getEmoji)("revolver")}`)
        .setDescription(message)
        .addFields({
        name: `${session.challenger.user.username}`,
        value: `♥️ ${(0, i18n_1.tLocale)(locale, "duel_hp", { hp: session.challenger.hp, maxHp: session.challenger.maxHp })}\n${createHealthBar(session.challenger)}`,
        inline: true,
    }, {
        name: (0, i18n_1.tLocale)(locale, "duel_vs"),
        value: `${(0, customEmojis_1.getEmoji)("cowboys")}`,
        inline: true,
    }, {
        name: `${session.opponent.user.username}`,
        value: `♥️ ${(0, i18n_1.tLocale)(locale, "duel_hp", { hp: session.opponent.hp, maxHp: session.opponent.maxHp })}\n${createHealthBar(session.opponent)}`,
        inline: true,
    }, {
        name: (0, i18n_1.tLocale)(locale, "duel_current_turn"),
        value: `${(0, customEmojis_1.getEmoji)("cowboy")} **${currentPlayer.user.username}**`,
        inline: false,
    })
        .setColor(0xd4af37)
        .setFooter({
        text: (0, i18n_1.tLocale)(locale, "duel_bet_info", { amount: session.bet }).replace(/\n/, ""),
    })
        .setTimestamp();
    return embed;
}
function createHealthBar(player) {
    const percentage = (player.hp / player.maxHp) * 100;
    const filledBars = Math.floor(percentage / 10);
    const emptyBars = 10 - filledBars;
    let color = "🟢";
    if (percentage < 30)
        color = "🔴";
    else if (percentage < 60)
        color = "🟡";
    return `${color} ${"█".repeat(filledBars)}${"░".repeat(emptyBars)} ${Math.round(percentage)}%`;
}
function createActionButtons(player, locale) {
    const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId("duel_attack")
        .setLabel((0, i18n_1.tLocale)(locale, "duel_quick_draw"))
        .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
        .setCustomId("duel_defend")
        .setLabel((0, i18n_1.tLocale)(locale, "duel_take_cover"))
        .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
        .setCustomId("duel_special")
        .setLabel((0, i18n_1.tLocale)(locale, "duel_headshot"))
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(player.specialUsed));
    return row;
}
async function processTurn(session, action) {
    const attacker = session.turn === "challenger" ? session.challenger : session.opponent;
    const defender = session.turn === "challenger" ? session.opponent : session.challenger;
    const wasDefending = defender.defense;
    let damage = 0;
    let weaponBroken = false;
    let brokenWeaponName = "";
    if (action === "defend") {
        attacker.defense = true;
    }
    else {
        if (action === "special") {
            attacker.specialUsed = true;
            damage = calculateDamage(attacker, defender, true);
            defender.hp = Math.max(0, defender.hp - damage);
        }
        else {
            damage = calculateDamage(attacker, defender, false);
            defender.hp = Math.max(0, defender.hp - damage);
        }
        const durabilityResult = await (0, inventoryManager_1.reduceDurability)(attacker.user.id, attacker.weaponId);
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
function getActionMessage(session, action, result, attackerName, defenderName, overrideLocale) {
    const locale = overrideLocale ||
        (session.turn === "challenger"
            ? session.challengerLocale
            : session.opponentLocale);
    if (action === "defend") {
        return `${(0, customEmojis_1.getEmoji)("mute")} ${(0, i18n_1.tLocale)(locale, "duel_action_defend", { user: attackerName })}`;
    }
    else if (action === "special") {
        if (result.wasDefending) {
            return `${(0, customEmojis_1.getEmoji)("lightning")} ${(0, i18n_1.tLocale)(locale, "duel_action_special_cover", { user: attackerName, target: defenderName })}\n💥 ${(0, i18n_1.tLocale)(locale, "duel_dealt_damage_reduced", { damage: result.damage })}`;
        }
        else {
            return `${(0, customEmojis_1.getEmoji)("lightning")} ${(0, i18n_1.tLocale)(locale, "duel_action_special", { user: attackerName })}\n💥 ${(0, i18n_1.tLocale)(locale, "duel_dealt_damage", { damage: result.damage })}`;
        }
    }
    else {
        if (result.wasDefending) {
            return `${(0, customEmojis_1.getEmoji)("revolver")} ${(0, i18n_1.tLocale)(locale, "duel_action_attack_cover", { user: attackerName, target: defenderName })}\n🎯 ${(0, i18n_1.tLocale)(locale, "duel_dealt_damage_reduced", { damage: result.damage })}`;
        }
        else {
            return `${(0, customEmojis_1.getEmoji)("revolver")} ${(0, i18n_1.tLocale)(locale, "duel_action_attack", { user: attackerName })}\n🎯 ${(0, i18n_1.tLocale)(locale, "duel_dealt_damage", { damage: result.damage })}`;
        }
    }
}
async function checkWinner(session) {
    if (session.challenger.hp <= 0) {
        return session.opponent;
    }
    if (session.opponent.hp <= 0) {
        return session.challenger;
    }
    return null;
}
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName("duel")
    .setDescription("🤠 Challenge another cowboy to a duel!")
    .setDescriptionLocalizations({
    "pt-BR": "🤠 Desafie outro cowboy para um duelo!",
})
    .addUserOption((option) => option
    .setName("opponent")
    .setDescription("The cowboy you want to duel")
    .setDescriptionLocalizations({
    "pt-BR": "O cowboy que você quer duelar",
})
    .setRequired(true))
    .addStringOption((option) => option
    .setName("weapon")
    .setDescription("Choose your weapon for the duel")
    .setDescriptionLocalizations({
    "pt-BR": "Escolha sua arma para o duelo",
})
    .setRequired(true)
    .addChoices({ name: "🔫 Escopeta (85 dano)", value: "escopeta" }, { name: "🔫 Revólver de Vaqueiro (65 dano)", value: "revolver_vaqueiro" }, { name: "🔫 Revólver Calibre 38 (55 dano)", value: "revolver_38" }))
    .addIntegerOption((option) => option
    .setName("bet")
    .setDescription("Amount of Silver Coins to bet (winner takes all)")
    .setDescriptionLocalizations({
    "pt-BR": "Quantidade de Moedas de Prata para apostar (vencedor leva tudo)",
})
    .setRequired(false)
    .setMinValue(0)
    .setMaxValue(10000000));
async function execute(interaction) {
    const opponent = interaction.options.getUser("opponent", true);
    const bet = interaction.options.getInteger("bet") || 0;
    const selectedWeapon = interaction.options.getString("weapon", true);
    if (opponent.id === interaction.user.id) {
        await interaction.reply({
            content: `${(0, customEmojis_1.getEmoji)("warning")} ${(0, i18n_1.t)(interaction, "duel_cant_self")}`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    if (opponent.bot) {
        await interaction.reply({
            content: `${(0, customEmojis_1.getEmoji)("warning")} ${(0, i18n_1.t)(interaction, "duel_cant_bot")}`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const challengerWeapon = getSelectedWeapon(interaction.user.id, selectedWeapon);
    if (!challengerWeapon) {
        await interaction.reply({
            content: `${(0, customEmojis_1.getEmoji)("warning")} Você não possui ${inventoryManager_1.ITEMS[selectedWeapon]?.name} no inventário! Visite a armaria com \`/armaria\` para comprar.`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const opponentWeapons = getAvailableWeapons(opponent.id);
    if (opponentWeapons.length === 0) {
        await interaction.reply({
            content: `${(0, customEmojis_1.getEmoji)("warning")} ${opponent.username} não possui nenhuma arma no inventário e não pode duelar!`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    // Security: Validate bet amount
    if (bet > 0 && !(0, security_1.isValidBetAmount)(bet)) {
        await interaction.reply({
            content: "❌ Invalid bet amount! Maximum bet is 10,000,000 silver coins.",
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const duelId = `${interaction.user.id}-${opponent.id}`;
    const reverseDuelId = `${opponent.id}-${interaction.user.id}`;
    if (activeDuels.has(duelId) || activeDuels.has(reverseDuelId)) {
        await interaction.reply({
            content: `${(0, customEmojis_1.getEmoji)("warning")} ${(0, i18n_1.t)(interaction, "duel_active_already")}`,
            flags: discord_js_1.MessageFlags.Ephemeral,
        });
        return;
    }
    const acceptButton = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId("duel_accept")
        .setLabel((0, i18n_1.t)(interaction, "duel_accept_btn"))
        .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
        .setCustomId("duel_decline")
        .setLabel((0, i18n_1.t)(interaction, "duel_decline_btn"))
        .setStyle(discord_js_1.ButtonStyle.Secondary));
    const betInfo = bet > 0
        ? (0, i18n_1.t)(interaction, "duel_bet_info", { amount: bet })
        : (0, i18n_1.t)(interaction, "duel_no_bet");
    const challengeEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`${(0, customEmojis_1.getEmoji)("cowboys")} ${(0, i18n_1.t)(interaction, "duel_challenge_title")} ${(0, customEmojis_1.getEmoji)("cowboys")}`)
        .setDescription((0, i18n_1.t)(interaction, "duel_challenge_desc", {
        challenger: interaction.user.username,
        opponent: opponent.username,
        bet_info: betInfo,
    }) + `\n\n**Arma do desafiante:**\n🔫 ${interaction.user.username}: ${challengerWeapon.name} (${challengerWeapon.damage} dano)`)
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
            componentType: discord_js_1.ComponentType.Button,
            time: 60000,
        });
        if (confirmation.customId === "duel_decline") {
            await confirmation.update({
                content: `${(0, customEmojis_1.getEmoji)("cancel")} ${(0, i18n_1.t)(confirmation, "duel_declined", { user: opponent.username })}`,
                embeds: [],
                components: [],
            });
            return;
        }
        const weaponSelectMenu = new discord_js_1.StringSelectMenuBuilder()
            .setCustomId("weapon_select")
            .setPlaceholder("Escolha sua arma para o duelo")
            .addOptions(opponentWeapons.map(weapon => new discord_js_1.StringSelectMenuOptionBuilder()
            .setLabel(`${weapon.name} (${weapon.damage} dano)`)
            .setDescription(`Dano: ${weapon.damage}`)
            .setValue(weapon.id)
            .setEmoji("🔫")));
        const weaponRow = new discord_js_1.ActionRowBuilder().addComponents(weaponSelectMenu);
        await confirmation.update({
            content: `${(0, customEmojis_1.getEmoji)("check")} ${opponent.username}, escolha sua arma para o duelo:`,
            embeds: [],
            components: [weaponRow],
        });
        const weaponSelection = await confirmation.message.awaitMessageComponent({
            filter: (i) => i.user.id === opponent.id,
            componentType: discord_js_1.ComponentType.StringSelect,
            time: 60000,
        });
        const opponentWeaponId = weaponSelection.values[0];
        const challengerPlayer = createPlayer(interaction.user, selectedWeapon);
        const opponentPlayer = createPlayer(opponent, opponentWeaponId);
        if (!challengerPlayer || !opponentPlayer) {
            await weaponSelection.update({
                content: `${(0, customEmojis_1.getEmoji)("warning")} Erro ao iniciar duelo: um dos jogadores não possui arma.`,
                embeds: [],
                components: [],
            });
            return;
        }
        const session = {
            challenger: challengerPlayer,
            opponent: opponentPlayer,
            turn: Math.random() < 0.5 ? "challenger" : "opponent",
            bet,
            active: true,
            challengerLocale: (0, i18n_1.getLocale)(interaction),
            opponentLocale: (0, i18n_1.getLocale)(weaponSelection),
        };
        activeDuels.set(duelId, session);
        const currentLocale = session.turn === "challenger"
            ? session.challengerLocale
            : session.opponentLocale;
        const startMessage = `${(0, customEmojis_1.getEmoji)("check")} ${(0, i18n_1.tLocale)(currentLocale, "duel_accepted")}\n\n` +
            `**Armas:**\n🔫 ${interaction.user.username}: ${challengerPlayer.weaponName} (${challengerPlayer.weaponDamage} dano)\n🔫 ${opponent.username}: ${opponentPlayer.weaponName} (${opponentPlayer.weaponDamage} dano)\n\n` +
            `${(0, customEmojis_1.getEmoji)("cowboy_horse")} ${(0, i18n_1.tLocale)(currentLocale, "duel_first_turn", { user: session.turn === "challenger" ? interaction.user.username : opponent.username })}`;
        await weaponSelection.update({
            content: "",
            embeds: [createDuelEmbed(session, startMessage)],
            components: [
                createActionButtons(session.turn === "challenger" ? session.challenger : session.opponent, session.turn === "challenger"
                    ? session.challengerLocale
                    : session.opponentLocale),
            ],
            attachments: [],
        });
        let currentMessage = await weaponSelection.fetchReply();
        while (session.active) {
            const currentPlayer = session.turn === "challenger" ? session.challenger : session.opponent;
            try {
                const actionInteraction = await currentMessage.awaitMessageComponent({
                    filter: (i) => {
                        if (i.user.id !== currentPlayer.user.id) {
                            const userLocale = (0, i18n_1.getLocale)(i);
                            i.reply({
                                content: `${(0, customEmojis_1.getEmoji)("warning")} ${(0, i18n_1.tLocale)(userLocale, "duel_participants_only")}`,
                                flags: discord_js_1.MessageFlags.Ephemeral,
                            }).catch(() => { });
                            return false;
                        }
                        return true;
                    },
                    componentType: discord_js_1.ComponentType.Button,
                    time: 60000,
                });
                const action = actionInteraction.customId.replace("duel_", "");
                const previousAttacker = session.turn === "challenger" ? session.challenger : session.opponent;
                const previousDefender = session.turn === "challenger" ? session.opponent : session.challenger;
                const turnResult = await processTurn(session, action);
                const winner = await checkWinner(session);
                if (winner) {
                    session.active = false;
                    activeDuels.delete(duelId);
                    const loser = winner === session.challenger
                        ? session.opponent
                        : session.challenger;
                    const winnerLocale = winner === session.challenger
                        ? session.challengerLocale
                        : session.opponentLocale;
                    const winnerXpResult = (0, xpManager_1.addXp)(winner.user.id, 50, true);
                    const loserXpResult = (0, xpManager_1.addXp)(loser.user.id, 15, true);
                    let xpMessage = "";
                    if (winnerXpResult.granted && loserXpResult.granted) {
                        xpMessage = `\n\n⭐ **${(0, i18n_1.tLocale)(winnerLocale, "duel_xp_gained")}:**`;
                        xpMessage += `\n${(0, i18n_1.tLocale)(winnerLocale, "duel_xp_amount", { user: winner.user.username, amount: "50" })}`;
                        if (winnerXpResult.leveledUp) {
                            xpMessage += ` 🎉 (${(0, i18n_1.tLocale)(winnerLocale, "duel_xp_levelup", { oldLevel: winnerXpResult.oldLevel, newLevel: winnerXpResult.newLevel })})`;
                        }
                        xpMessage += `\n${(0, i18n_1.tLocale)(winnerLocale, "duel_xp_amount", { user: loser.user.username, amount: "15" })}`;
                        if (loserXpResult.leveledUp) {
                            xpMessage += ` 🎉 (${(0, i18n_1.tLocale)(winnerLocale, "duel_xp_levelup", { oldLevel: loserXpResult.oldLevel, newLevel: loserXpResult.newLevel })})`;
                        }
                    }
                    let actionMessage = getActionMessage(session, action, turnResult, previousAttacker.user.username, previousDefender.user.username, winnerLocale);
                    if (turnResult.weaponBroken) {
                        const brokenMessage = `\n${(0, i18n_1.tLocale)(winnerLocale, "duel_weapon_broken", {
                            weapon: turnResult.brokenWeaponName,
                            user: previousAttacker.user.username
                        })}`;
                        actionMessage += brokenMessage;
                    }
                    const winnerMessage = `${actionMessage}\n\n${(0, customEmojis_1.getEmoji)("star")} ${(0, i18n_1.tLocale)(winnerLocale, "duel_winner", { user: winner.user.username })}\n\n` +
                        (bet > 0
                            ? `${(0, customEmojis_1.getEmoji)("moneybag")} ${(0, i18n_1.tLocale)(winnerLocale, "duel_won_coins", { amount: bet })}`
                            : "") +
                        xpMessage;
                    const winnerEmbed = new discord_js_1.EmbedBuilder()
                        .setTitle(`${(0, customEmojis_1.getEmoji)("trophy")} ${(0, i18n_1.tLocale)(winnerLocale, "duel_complete")} ${(0, customEmojis_1.getEmoji)("trophy")}`)
                        .setDescription(winnerMessage)
                        .setColor(0xffd700)
                        .setTimestamp();
                    await actionInteraction.update({
                        embeds: [winnerEmbed],
                        components: [],
                    });
                    return;
                }
                let actionMessage = getActionMessage(session, action, turnResult, previousAttacker.user.username, previousDefender.user.username);
                if (turnResult.weaponBroken) {
                    const attackerLocale = turnResult.attackerUserId === interaction.user.id
                        ? session.challengerLocale
                        : session.opponentLocale;
                    const brokenMessage = `\n${(0, i18n_1.tLocale)(attackerLocale, "duel_weapon_broken", {
                        weapon: turnResult.brokenWeaponName,
                        user: previousAttacker.user.username
                    })}`;
                    actionMessage += brokenMessage;
                }
                await actionInteraction.update({
                    embeds: [createDuelEmbed(session, actionMessage)],
                    components: [
                        createActionButtons(session.turn === "challenger"
                            ? session.challenger
                            : session.opponent, session.turn === "challenger"
                            ? session.challengerLocale
                            : session.opponentLocale),
                    ],
                });
                currentMessage = await actionInteraction.fetchReply();
            }
            catch (error) {
                session.active = false;
                activeDuels.delete(duelId);
                const timedOutLocale = currentPlayer === session.challenger
                    ? session.challengerLocale
                    : session.opponentLocale;
                try {
                    await currentMessage.edit({
                        content: `${(0, customEmojis_1.getEmoji)("timer")} ${(0, i18n_1.tLocale)(timedOutLocale, "duel_timeout", { user: currentPlayer.user.username })}`,
                        embeds: [],
                        components: [],
                    });
                }
                catch (editError) {
                    console.error("Failed to edit duel timeout message:", editError);
                }
                return;
            }
        }
    }
    catch (error) {
        try {
            await interaction.editReply({
                content: `${(0, customEmojis_1.getEmoji)("timer")} ${(0, i18n_1.t)(interaction, "duel_challenge_expired")}`,
                embeds: [],
                components: [],
            });
        }
        catch (editError) {
            console.error("Failed to edit expired duel challenge:", editError);
        }
    }
}
exports.cooldown = 30;
const command = { data: exports.data, execute, cooldown: exports.cooldown };
exports.default = command;
//# sourceMappingURL=duel.js.map