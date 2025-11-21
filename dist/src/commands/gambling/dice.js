"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dataManager_1 = require("../../utils/dataManager");
const i18n_1 = require("../../utils/i18n");
const security_1 = require("../../utils/security");
/**
 * Cooldown management for dice game
 */
const cooldowns = new Map();
/**
 * Active game sessions
 */
const activeGames = new Map();
/**
 * Dice Command - Two-player dice guessing game with betting
 */
const command = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("dice")
        .setDescription("Challenge another player to a dice duel!")
        .addUserOption((option) => option
        .setName("opponent")
        .setDescription("The player you want to challenge")
        .setRequired(true))
        .addIntegerOption((option) => option
        .setName("bet")
        .setDescription("Amount of Saloon Tokens to bet")
        .setRequired(true)
        .setMinValue(10)
        .setMaxValue(10000000))
        .addIntegerOption((option) => option
        .setName("guess")
        .setDescription("Your guess for the dice total (2-12)")
        .setRequired(true)
        .setMinValue(2)
        .setMaxValue(12)),
    async execute(interaction) {
        const challenger = interaction.user;
        const opponent = interaction.options.getUser("opponent");
        const bet = interaction.options.getInteger("bet");
        const challengerGuess = interaction.options.getInteger("guess");
        if (!opponent || !bet || !challengerGuess) {
            await interaction.reply({
                content: (0, i18n_1.t)(interaction, "dice_specify_all"),
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const now = Date.now();
        const cooldownAmount = 10000;
        if (opponent.bot) {
            await interaction.reply({
                content: (0, i18n_1.t)(interaction, "dice_cant_challenge_bot"),
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        if (opponent.id === challenger.id) {
            await interaction.reply({
                content: (0, i18n_1.t)(interaction, "dice_cant_challenge_self"),
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        if (cooldowns.has(challenger.id)) {
            const challengerCooldown = cooldowns.get(challenger.id);
            if (challengerCooldown) {
                const expirationTime = challengerCooldown + cooldownAmount;
                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    await interaction.reply({
                        content: (0, i18n_1.t)(interaction, "dice_cooldown_wait", {
                            seconds: timeLeft.toFixed(1),
                        }),
                        flags: discord_js_1.MessageFlags.Ephemeral,
                    });
                    return;
                }
            }
        }
        if (cooldowns.has(opponent.id)) {
            const opponentCooldown = cooldowns.get(opponent.id);
            if (opponentCooldown) {
                const expirationTime = opponentCooldown + cooldownAmount;
                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    await interaction.reply({
                        content: (0, i18n_1.t)(interaction, "dice_opponent_cooldown", {
                            user: opponent.tag,
                            seconds: timeLeft.toFixed(1),
                        }),
                        flags: discord_js_1.MessageFlags.Ephemeral,
                    });
                    return;
                }
            }
        }
        if (activeGames.has(challenger.id) || activeGames.has(opponent.id)) {
            await interaction.reply({
                content: (0, i18n_1.t)(interaction, "dice_already_active"),
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        // Security: Validate bet amount
        if (!(0, security_1.isValidBetAmount)(bet)) {
            await interaction.reply({
                content: "❌ Invalid bet amount! Maximum bet is 10,000,000 tokens.",
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const challengerGold = (0, dataManager_1.getUserGold)(challenger.id);
        const opponentGold = (0, dataManager_1.getUserGold)(opponent.id);
        if (challengerGold < bet) {
            await interaction.reply({
                content: (0, i18n_1.t)(interaction, "dice_not_enough_tokens", {
                    current: challengerGold,
                    bet,
                }),
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        if (opponentGold < bet) {
            await interaction.reply({
                content: (0, i18n_1.t)(interaction, "dice_opponent_not_enough", {
                    user: opponent.tag,
                    amount: opponentGold,
                }),
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            return;
        }
        const gameId = `${challenger.id}_${Date.now()}`;
        const guessButtons = [];
        for (let i = 2; i <= 12; i++) {
            guessButtons.push(new discord_js_1.ButtonBuilder()
                .setCustomId(`dice_guess_${gameId}_${i}`)
                .setLabel(`${i}`)
                .setStyle(discord_js_1.ButtonStyle.Secondary));
        }
        const rows = [
            new discord_js_1.ActionRowBuilder().addComponents(guessButtons.slice(0, 5)),
            new discord_js_1.ActionRowBuilder().addComponents(guessButtons.slice(5, 10)),
            new discord_js_1.ActionRowBuilder().addComponents(guessButtons.slice(10)),
        ];
        const challengeEmbed = new discord_js_1.EmbedBuilder()
            .setColor("#FFD700")
            .setTitle((0, i18n_1.t)(interaction, "dice_challenge_title"))
            .setDescription((0, i18n_1.t)(interaction, "dice_challenge_desc", {
            challenger: challenger.tag,
            opponent: opponent.tag,
            bet,
            guess: challengerGuess,
        }))
            .setImage("https://i.postimg.cc/Ssffp0bs/IMG-3261.png")
            .addFields({
            name: (0, i18n_1.t)(interaction, "dice_time_limit"),
            value: (0, i18n_1.t)(interaction, "dice_time_accept"),
            inline: true,
        }, {
            name: (0, i18n_1.t)(interaction, "dice_winner_takes_all"),
            value: (0, i18n_1.t)(interaction, "dice_total_tokens", { total: bet * 2 }),
            inline: true,
        })
            .setFooter({ text: (0, i18n_1.t)(interaction, "dice_choose_wisely") })
            .setTimestamp();
        await interaction.reply({
            content: (0, i18n_1.t)(interaction, "dice_challenged", { user: `${opponent}` }),
            embeds: [challengeEmbed],
            components: rows,
        });
        const message = await interaction.fetchReply();
        activeGames.set(challenger.id, gameId);
        activeGames.set(opponent.id, gameId);
        const collector = message.createMessageComponentCollector({
            filter: (i) => i.user.id === opponent.id &&
                i.customId.startsWith(`dice_guess_${gameId}`),
            time: 30000,
            max: 1,
        });
        collector.on("collect", async (i) => {
            const opponentGuess = parseInt(i.customId.split("_").pop() || "0");
            const dice1 = Math.floor(Math.random() * 6) + 1;
            const dice2 = Math.floor(Math.random() * 6) + 1;
            const total = dice1 + dice2;
            const challengerDiff = Math.abs(total - challengerGuess);
            const opponentDiff = Math.abs(total - opponentGuess);
            let winner, loser, winnerGuess, loserGuess;
            if (challengerDiff < opponentDiff) {
                winner = challenger;
                loser = opponent;
                winnerGuess = challengerGuess;
                loserGuess = opponentGuess;
            }
            else if (opponentDiff < challengerDiff) {
                winner = opponent;
                loser = challenger;
                winnerGuess = opponentGuess;
                loserGuess = challengerGuess;
            }
            else {
                const tieEmbed = new discord_js_1.EmbedBuilder()
                    .setColor("#FFD700")
                    .setTitle((0, i18n_1.t)(i, "dice_tie_title"))
                    .setDescription((0, i18n_1.t)(i, "dice_tie_desc", { dice1, dice2, total }))
                    .addFields({
                    name: (0, i18n_1.t)(i, "dice_challenger_guess", { user: challenger.tag }),
                    value: (0, i18n_1.t)(i, "dice_diff", {
                        guess: challengerGuess,
                        diff: challengerDiff,
                    }),
                    inline: true,
                }, {
                    name: (0, i18n_1.t)(i, "dice_opponent_guess", { user: opponent.tag }),
                    value: (0, i18n_1.t)(i, "dice_diff", {
                        guess: opponentGuess,
                        diff: opponentDiff,
                    }),
                    inline: true,
                }, {
                    name: (0, i18n_1.t)(i, "dice_result"),
                    value: (0, i18n_1.t)(i, "dice_bets_returned"),
                    inline: false,
                })
                    .setFooter({ text: (0, i18n_1.t)(i, "dice_perfectly_balanced") })
                    .setTimestamp();
                await i.update({ embeds: [tieEmbed], components: [] });
                activeGames.delete(challenger.id);
                activeGames.delete(opponent.id);
                cooldowns.set(challenger.id, Date.now());
                cooldowns.set(opponent.id, Date.now());
                setTimeout(() => {
                    cooldowns.delete(challenger.id);
                    cooldowns.delete(opponent.id);
                }, cooldownAmount);
                return;
            }
            const transferResult = await (0, dataManager_1.transferGold)(loser.id, winner.id, bet);
            if (!transferResult.success) {
                const fullInventoryEmbed = new discord_js_1.EmbedBuilder()
                    .setColor("#FF0000")
                    .setTitle((0, i18n_1.t)(i, "dice_inventory_full_title"))
                    .setDescription((0, i18n_1.t)(i, "dice_winner_inventory_full", {
                    winner: winner.tag,
                    loser: loser.tag,
                    dice1,
                    dice2,
                    total,
                }))
                    .addFields({
                    name: (0, i18n_1.t)(i, "dice_winner_guess_label", { user: winner.tag }),
                    value: (0, i18n_1.t)(i, "dice_difference", {
                        guess: winnerGuess,
                        diff: Math.abs(total - winnerGuess),
                    }),
                    inline: true,
                }, {
                    name: (0, i18n_1.t)(i, "dice_loser_guess_label", { user: loser.tag }),
                    value: (0, i18n_1.t)(i, "dice_difference", {
                        guess: loserGuess,
                        diff: Math.abs(total - loserGuess),
                    }),
                    inline: true,
                })
                    .setFooter({ text: (0, i18n_1.t)(i, "dice_clean_inventory") })
                    .setTimestamp();
                await i.update({ embeds: [fullInventoryEmbed], components: [] });
            }
            else {
                const winnerNewGold = (0, dataManager_1.getUserGold)(winner.id);
                const loserNewGold = (0, dataManager_1.getUserGold)(loser.id);
                const resultEmbed = new discord_js_1.EmbedBuilder()
                    .setColor("#00FF00")
                    .setTitle((0, i18n_1.t)(i, "dice_results_title"))
                    .setDescription((0, i18n_1.t)(i, "dice_showed", { dice1, dice2, total }) +
                    "\n\n" +
                    (0, i18n_1.t)(i, "dice_winner_wins", { winner: winner.tag, total: bet * 2 }))
                    .addFields({
                    name: (0, i18n_1.t)(i, "dice_winner_guess_label", { user: winner.tag }),
                    value: (0, i18n_1.t)(i, "dice_difference", {
                        guess: winnerGuess,
                        diff: Math.abs(total - winnerGuess),
                    }),
                    inline: true,
                }, {
                    name: (0, i18n_1.t)(i, "dice_loser_guess_label", { user: loser.tag }),
                    value: (0, i18n_1.t)(i, "dice_difference", {
                        guess: loserGuess,
                        diff: Math.abs(total - loserGuess),
                    }),
                    inline: true,
                }, { name: "\u200B", value: "\u200B", inline: false }, {
                    name: (0, i18n_1.t)(i, "dice_tokens_label", { user: winner.tag }),
                    value: (0, i18n_1.t)(i, "dice_tokens_amount", { amount: winnerNewGold }),
                    inline: true,
                }, {
                    name: (0, i18n_1.t)(i, "dice_tokens_label", { user: loser.tag }),
                    value: (0, i18n_1.t)(i, "dice_tokens_amount", { amount: loserNewGold }),
                    inline: true,
                })
                    .setFooter({
                    text: (0, i18n_1.t)(i, "dice_called_closest", { user: winner.tag }),
                })
                    .setTimestamp();
                await i.update({ embeds: [resultEmbed], components: [] });
            }
            activeGames.delete(challenger.id);
            activeGames.delete(opponent.id);
            cooldowns.set(challenger.id, Date.now());
            cooldowns.set(opponent.id, Date.now());
            setTimeout(() => {
                cooldowns.delete(challenger.id);
                cooldowns.delete(opponent.id);
            }, cooldownAmount);
        });
        collector.on("end", (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new discord_js_1.EmbedBuilder()
                    .setColor("#808080")
                    .setTitle((0, i18n_1.t)(interaction, "dice_challenge_expired"))
                    .setDescription((0, i18n_1.t)(interaction, "dice_no_response", { user: opponent.tag }))
                    .setFooter({ text: (0, i18n_1.t)(interaction, "dice_better_luck") })
                    .setTimestamp();
                message.edit({ embeds: [timeoutEmbed], components: [] });
                activeGames.delete(challenger.id);
                activeGames.delete(opponent.id);
            }
        });
    },
};
exports.default = command;
//# sourceMappingURL=dice.js.map