"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const guildManager_1 = require("../../utils/guildManager");
const i18n_1 = require("../../utils/i18n");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("guilda")
        .setDescription("🏰 Sistema de Guildas - Crie ou entre em uma guilda!"),
    async execute(interaction) {
        const userGuild = (0, guildManager_1.getUserGuild)(interaction.user.id);
        const isInGuild = (0, guildManager_1.isUserInGuild)(interaction.user.id);
        if (isInGuild && userGuild) {
            const memberCount = userGuild.members.length;
            const maxMembers = userGuild.settings.maxMembers;
            const isLeader = userGuild.leaderId === interaction.user.id;
            const guildEmbed = new discord_js_1.EmbedBuilder()
                .setColor("#FFD700")
                .setTitle(`🏰 ${userGuild.name}`)
                .setDescription(userGuild.description)
                .addFields({
                name: (0, i18n_1.tUser)(interaction.user.id, "guild_leader"),
                value: `<@${userGuild.leaderId}>`,
                inline: true,
            }, {
                name: (0, i18n_1.tUser)(interaction.user.id, "guild_members"),
                value: `${memberCount}/${maxMembers}`,
                inline: true,
            }, {
                name: (0, i18n_1.tUser)(interaction.user.id, "guild_level"),
                value: `${userGuild.level}`,
                inline: true,
            }, {
                name: (0, i18n_1.tUser)(interaction.user.id, "guild_xp"),
                value: `${userGuild.xp} XP`,
                inline: true,
            }, {
                name: (0, i18n_1.tUser)(interaction.user.id, "guild_type"),
                value: userGuild.settings.isPublic
                    ? (0, i18n_1.tUser)(interaction.user.id, "guild_type_public")
                    : (0, i18n_1.tUser)(interaction.user.id, "guild_type_private"),
                inline: true,
            }, {
                name: (0, i18n_1.tUser)(interaction.user.id, "guild_created"),
                value: `<t:${Math.floor(userGuild.createdAt / 1000)}:R>`,
                inline: true,
            })
                .setFooter({
                text: isLeader
                    ? (0, i18n_1.tUser)(interaction.user.id, "guild_role_leader")
                    : (0, i18n_1.tUser)(interaction.user.id, "guild_role_member"),
            })
                .setTimestamp();
            const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId("guild_info")
                .setLabel((0, i18n_1.tUser)(interaction.user.id, "guild_btn_info"))
                .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
                .setCustomId("guild_members")
                .setLabel((0, i18n_1.tUser)(interaction.user.id, "guild_btn_members"))
                .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
                .setCustomId("guild_leave")
                .setLabel((0, i18n_1.tUser)(interaction.user.id, "guild_btn_leave"))
                .setStyle(discord_js_1.ButtonStyle.Danger));
            await interaction.reply({
                embeds: [guildEmbed],
                components: [row],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            const guildReply = await interaction.fetchReply();
            // Collector para os botões da guilda
            const guildCollector = guildReply.createMessageComponentCollector({
                componentType: discord_js_1.ComponentType.Button,
                time: 300000, // 5 minutos
            });
            guildCollector.on("collect", async (buttonInteraction) => {
                if (buttonInteraction.user.id !== interaction.user.id) {
                    await buttonInteraction.reply({
                        content: (0, i18n_1.tUser)(buttonInteraction.user.id, "guild_not_your_interaction"),
                        flags: discord_js_1.MessageFlags.Ephemeral,
                    });
                    return;
                }
                if (buttonInteraction.customId === "guild_members") {
                    // IMPORTANTE: Responder IMEDIATAMENTE para evitar timeout
                    try {
                        await buttonInteraction.deferReply({
                            flags: discord_js_1.MessageFlags.Ephemeral,
                        });
                    }
                    catch (error) {
                        // Interação expirou, ignorar
                        console.error("Interaction expired:", error);
                        return;
                    }
                    const currentGuild = (0, guildManager_1.getUserGuild)(interaction.user.id);
                    if (!currentGuild) {
                        await buttonInteraction.editReply({
                            content: "❌ Você não está mais em uma guilda!",
                        });
                        return;
                    }
                    const userMember = currentGuild.members.find((m) => m.userId === interaction.user.id);
                    const canManage = userMember &&
                        (userMember.role === "leader" || userMember.role === "co-leader");
                    // Buscar dados atualizados da guilda
                    const freshGuild = (0, guildManager_1.getUserGuild)(interaction.user.id);
                    if (!freshGuild) {
                        await buttonInteraction.editReply({
                            content: "❌ Você não está mais em uma guilda!",
                        });
                        return;
                    }
                    // Mostrar lista de membros com botões de ação
                    const membersEmbed = new discord_js_1.EmbedBuilder()
                        .setColor("#FFD700")
                        .setTitle(`👥 Membros de ${freshGuild.name}`)
                        .setDescription(`Total: ${freshGuild.members.length}/${freshGuild.settings.maxMembers} membros`)
                        .setTimestamp();
                    // Organizar membros por cargo
                    const leader = freshGuild.members.find((m) => m.role === "leader");
                    const coLeaders = freshGuild.members.filter((m) => m.role === "co-leader");
                    const members = freshGuild.members.filter((m) => m.role === "member");
                    if (leader) {
                        membersEmbed.addFields({
                            name: "👑 Líder",
                            value: `<@${leader.userId}>`,
                            inline: false,
                        });
                    }
                    if (coLeaders.length > 0) {
                        membersEmbed.addFields({
                            name: "⭐ Co-líderes",
                            value: coLeaders.map((m) => `<@${m.userId}>`).join("\n"),
                            inline: false,
                        });
                    }
                    if (members.length > 0) {
                        membersEmbed.addFields({
                            name: "🔷 Membros",
                            value: members.map((m) => `<@${m.userId}>`).join("\n"),
                            inline: false,
                        });
                    }
                    // Sempre mostrar o menu de gerenciar membros para todos
                    const freshUserMember = freshGuild.members.find((m) => m.userId === interaction.user.id);
                    const freshCanManage = freshUserMember &&
                        (freshUserMember.role === "leader" ||
                            freshUserMember.role === "co-leader");
                    membersEmbed.setFooter({
                        text: freshCanManage
                            ? "Use o menu abaixo para gerenciar membros"
                            : "Use o menu abaixo para visualizar membros",
                    });
                    // Criar menu de seleção de membros (usar IDs, mais rápido)
                    const filteredMembers = freshGuild.members.filter((m) => m.userId !== interaction.user.id);
                    if (filteredMembers.length > 0) {
                        // Buscar informações dos membros para mostrar @username
                        const memberOptions = await Promise.all(filteredMembers.slice(0, 25).map(async (m) => {
                            const roleEmoji = m.role === "leader"
                                ? "👑"
                                : m.role === "co-leader"
                                    ? "⭐"
                                    : "🔷";
                            const roleName = m.role === "leader"
                                ? "Líder"
                                : m.role === "co-leader"
                                    ? "Co-líder"
                                    : "Membro";
                            let username = m.userId;
                            try {
                                const user = await interaction.client.users.fetch(m.userId);
                                username = user.username;
                            }
                            catch (error) {
                                // Se não conseguir buscar, usa o ID
                            }
                            return {
                                label: `${roleEmoji} @${username}`,
                                description: roleName,
                                value: m.userId,
                            };
                        }));
                        const memberSelect = new discord_js_1.StringSelectMenuBuilder()
                            .setCustomId("guild_member_select")
                            .setPlaceholder("📋 Selecione um membro para gerenciar")
                            .addOptions(memberOptions); // Já limitado a 25 acima
                        const selectRow = new discord_js_1.ActionRowBuilder().addComponents(memberSelect);
                        const memberSelectReply = await buttonInteraction.editReply({
                            embeds: [membersEmbed],
                            components: [selectRow],
                        });
                        // Collector para o menu de seleção de membros
                        const memberSelectCollector = memberSelectReply.createMessageComponentCollector({
                            componentType: discord_js_1.ComponentType.StringSelect,
                            time: 120000, // 2 minutos
                        });
                        memberSelectCollector.on("collect", async (selectInteraction) => {
                            if (selectInteraction.user.id !== interaction.user.id) {
                                await selectInteraction.reply({
                                    content: (0, i18n_1.tUser)(selectInteraction.user.id, "guild_not_your_interaction"),
                                    flags: discord_js_1.MessageFlags.Ephemeral,
                                });
                                return;
                            }
                            // Buscar dados atualizados novamente
                            const latestGuild = (0, guildManager_1.getUserGuild)(interaction.user.id);
                            if (!latestGuild) {
                                await selectInteraction.reply({
                                    content: "❌ Você não está mais em uma guilda!",
                                    flags: discord_js_1.MessageFlags.Ephemeral,
                                });
                                return;
                            }
                            const latestUserMember = latestGuild.members.find((m) => m.userId === interaction.user.id);
                            const latestCanManage = latestUserMember &&
                                (latestUserMember.role === "leader" ||
                                    latestUserMember.role === "co-leader");
                            // Verificar permissões PRIMEIRO antes de processar
                            if (!latestCanManage) {
                                await selectInteraction.reply({
                                    content: "❌ **Você não tem cargo para isso!**\n\nApenas o líder e co-líderes podem gerenciar membros da guilda.",
                                    flags: discord_js_1.MessageFlags.Ephemeral,
                                });
                                return;
                            }
                            const selectedUserId = selectInteraction.values[0];
                            const selectedMember = latestGuild.members.find((m) => m.userId === selectedUserId);
                            if (!selectedMember) {
                                await selectInteraction.reply({
                                    content: "❌ Membro não encontrado!",
                                    flags: discord_js_1.MessageFlags.Ephemeral,
                                });
                                return;
                            }
                            // Buscar informações do usuário selecionado
                            let selectedUser;
                            try {
                                selectedUser =
                                    await interaction.client.users.fetch(selectedUserId);
                            }
                            catch (error) {
                                await selectInteraction.reply({
                                    content: "❌ Não foi possível buscar informações deste usuário.",
                                    flags: discord_js_1.MessageFlags.Ephemeral,
                                });
                                return;
                            }
                            // Criar embed com informações do membro selecionado
                            const roleEmoji = selectedMember.role === "leader"
                                ? "👑"
                                : selectedMember.role === "co-leader"
                                    ? "⭐"
                                    : "🔷";
                            const roleName = selectedMember.role === "leader"
                                ? "Líder"
                                : selectedMember.role === "co-leader"
                                    ? "Co-líder"
                                    : "Membro";
                            const memberInfoEmbed = new discord_js_1.EmbedBuilder()
                                .setColor("#5865F2")
                                .setTitle(`${roleEmoji} Gerenciar Membro`)
                                .setDescription(`**${selectedUser.username}**`)
                                .addFields({ name: "Cargo", value: roleName, inline: true }, {
                                name: "Entrou em",
                                value: `<t:${Math.floor(selectedMember.joinedAt / 1000)}:R>`,
                                inline: true,
                            })
                                .setThumbnail(selectedUser.displayAvatarURL())
                                .setTimestamp();
                            // Criar botões de ação baseado nas permissões (usar dados atualizados)
                            const isLeader = latestUserMember?.role === "leader";
                            const actionButtons = [];
                            // Botão de expulsar (líder e co-líder podem expulsar membros normais)
                            if (selectedMember.role === "member") {
                                actionButtons.push(new discord_js_1.ButtonBuilder()
                                    .setCustomId(`guild_kick_${selectedUserId}`)
                                    .setLabel("Expulsar")
                                    .setEmoji("🚪")
                                    .setStyle(discord_js_1.ButtonStyle.Danger));
                            }
                            // Botão de promover (apenas líder pode promover)
                            if (isLeader && selectedMember.role === "member") {
                                actionButtons.push(new discord_js_1.ButtonBuilder()
                                    .setCustomId(`guild_promote_${selectedUserId}`)
                                    .setLabel("Promover a Co-líder")
                                    .setEmoji("⭐")
                                    .setStyle(discord_js_1.ButtonStyle.Success));
                            }
                            // Botão de rebaixar (apenas líder pode rebaixar)
                            if (isLeader && selectedMember.role === "co-leader") {
                                actionButtons.push(new discord_js_1.ButtonBuilder()
                                    .setCustomId(`guild_demote_${selectedUserId}`)
                                    .setLabel("Rebaixar a Membro")
                                    .setEmoji("🔻")
                                    .setStyle(discord_js_1.ButtonStyle.Secondary));
                                // Co-líder não pode ser expulso, apenas rebaixado
                                actionButtons.push(new discord_js_1.ButtonBuilder()
                                    .setCustomId(`guild_kick_${selectedUserId}`)
                                    .setLabel("Expulsar")
                                    .setEmoji("🚪")
                                    .setStyle(discord_js_1.ButtonStyle.Danger));
                            }
                            // Botão de cancelar
                            actionButtons.push(new discord_js_1.ButtonBuilder()
                                .setCustomId("guild_manage_cancel")
                                .setLabel("Cancelar")
                                .setEmoji("❌")
                                .setStyle(discord_js_1.ButtonStyle.Secondary));
                            if (actionButtons.length === 0 ||
                                selectedMember.role === "leader") {
                                await selectInteraction.reply({
                                    content: "❌ Você não pode gerenciar este membro!",
                                    flags: discord_js_1.MessageFlags.Ephemeral,
                                });
                                return;
                            }
                            const actionRow = new discord_js_1.ActionRowBuilder().addComponents(actionButtons);
                            await selectInteraction.reply({
                                embeds: [memberInfoEmbed],
                                components: [actionRow],
                                flags: discord_js_1.MessageFlags.Ephemeral,
                            });
                            const manageReply = await selectInteraction.fetchReply();
                            // Collector para os botões de ação
                            const actionCollector = manageReply.createMessageComponentCollector({
                                componentType: discord_js_1.ComponentType.Button,
                                time: 60000, // 1 minuto
                            });
                            actionCollector.on("collect", async (actionInteraction) => {
                                if (actionInteraction.user.id !== interaction.user.id) {
                                    await actionInteraction.reply({
                                        content: (0, i18n_1.tUser)(actionInteraction.user.id, "guild_not_your_interaction"),
                                        flags: discord_js_1.MessageFlags.Ephemeral,
                                    });
                                    return;
                                }
                                if (actionInteraction.customId === "guild_manage_cancel") {
                                    await actionInteraction.update({
                                        content: "❌ Operação cancelada.",
                                        embeds: [],
                                        components: [],
                                    });
                                    return;
                                }
                                // Processar ações
                                if (actionInteraction.customId.startsWith("guild_kick_")) {
                                    const targetId = actionInteraction.customId.replace("guild_kick_", "");
                                    const result = (0, guildManager_1.kickMember)(interaction.user.id, targetId);
                                    await actionInteraction.update({
                                        content: result.message,
                                        embeds: [],
                                        components: [],
                                    });
                                    // Notificar o usuário expulso
                                    if (result.success) {
                                        try {
                                            const kickedUser = await interaction.client.users.fetch(targetId);
                                            await kickedUser.send({
                                                content: `🚪 Você foi expulso da guilda **${latestGuild.name}** por <@${interaction.user.id}>.`,
                                            });
                                        }
                                        catch (error) {
                                            // Usuário pode ter DMs desativadas
                                        }
                                    }
                                }
                                else if (actionInteraction.customId.startsWith("guild_promote_")) {
                                    const targetId = actionInteraction.customId.replace("guild_promote_", "");
                                    const result = (0, guildManager_1.promoteMember)(interaction.user.id, targetId);
                                    await actionInteraction.update({
                                        content: result.message,
                                        embeds: [],
                                        components: [],
                                    });
                                    // Notificar o usuário promovido
                                    if (result.success) {
                                        try {
                                            const promotedUser = await interaction.client.users.fetch(targetId);
                                            await promotedUser.send({
                                                content: `⭐ Você foi promovido a Co-líder da guilda **${latestGuild.name}**! Parabéns!`,
                                            });
                                        }
                                        catch (error) {
                                            // Usuário pode ter DMs desativadas
                                        }
                                    }
                                }
                                else if (actionInteraction.customId.startsWith("guild_demote_")) {
                                    const targetId = actionInteraction.customId.replace("guild_demote_", "");
                                    const result = (0, guildManager_1.demoteMember)(interaction.user.id, targetId);
                                    await actionInteraction.update({
                                        content: result.message,
                                        embeds: [],
                                        components: [],
                                    });
                                    // Notificar o usuário rebaixado
                                    if (result.success) {
                                        try {
                                            const demotedUser = await interaction.client.users.fetch(targetId);
                                            await demotedUser.send({
                                                content: `🔻 Você foi rebaixado a Membro na guilda **${latestGuild.name}**.`,
                                            });
                                        }
                                        catch (error) {
                                            // Usuário pode ter DMs desativadas
                                        }
                                    }
                                }
                                actionCollector.stop();
                                memberSelectCollector.stop();
                            });
                            actionCollector.on("end", async (collected) => {
                                if (collected.size === 0) {
                                    try {
                                        await manageReply.edit({
                                            content: "⏱️ Tempo esgotado! Operação cancelada.",
                                            embeds: [],
                                            components: [],
                                        });
                                    }
                                    catch (error) {
                                        // Mensagem já foi editada ou deletada
                                    }
                                }
                            });
                        });
                        memberSelectCollector.on("end", async (collected) => {
                            if (collected.size === 0) {
                                try {
                                    await memberSelectReply.edit({
                                        content: "⏱️ Tempo esgotado! Seleção cancelada.",
                                        components: [],
                                    });
                                }
                                catch (error) {
                                    // Mensagem já foi editada ou deletada
                                }
                            }
                        });
                    }
                    else {
                        await buttonInteraction.editReply({
                            embeds: [membersEmbed],
                            content: "📝 Você é o único membro da guilda.",
                        });
                    }
                }
                else if (buttonInteraction.customId === "guild_info") {
                    const currentGuild = (0, guildManager_1.getUserGuild)(interaction.user.id);
                    if (!currentGuild) {
                        await buttonInteraction.reply({
                            content: "❌ Você não está mais em uma guilda!",
                            flags: discord_js_1.MessageFlags.Ephemeral,
                        });
                        return;
                    }
                    // Mostrar informações detalhadas da guilda
                    const infoEmbed = new discord_js_1.EmbedBuilder()
                        .setColor("#5865F2")
                        .setTitle(`ℹ️ Informações de ${currentGuild.name}`)
                        .setDescription(currentGuild.description)
                        .addFields({
                        name: "👑 Líder",
                        value: `<@${currentGuild.leaderId}>`,
                        inline: true,
                    }, {
                        name: "📊 Nível",
                        value: `${currentGuild.level}`,
                        inline: true,
                    }, {
                        name: "⭐ XP",
                        value: `${currentGuild.xp}`,
                        inline: true,
                    }, {
                        name: "👥 Membros",
                        value: `${currentGuild.members.length}/${currentGuild.settings.maxMembers}`,
                        inline: true,
                    }, {
                        name: "🔓 Tipo",
                        value: currentGuild.settings.isPublic ? "Pública" : "Privada",
                        inline: true,
                    }, {
                        name: "📅 Criada",
                        value: `<t:${Math.floor(currentGuild.createdAt / 1000)}:R>`,
                        inline: true,
                    })
                        .setTimestamp();
                    await buttonInteraction.reply({
                        embeds: [infoEmbed],
                        flags: discord_js_1.MessageFlags.Ephemeral,
                    });
                }
                else if (buttonInteraction.customId === "guild_leave") {
                    const currentGuild = (0, guildManager_1.getUserGuild)(interaction.user.id);
                    if (!currentGuild) {
                        await buttonInteraction.reply({
                            content: "❌ Você não está mais em uma guilda!",
                            flags: discord_js_1.MessageFlags.Ephemeral,
                        });
                        return;
                    }
                    // Confirmar saída da guilda
                    const confirmRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                        .setCustomId("guild_leave_confirm")
                        .setLabel("✅ Confirmar")
                        .setStyle(discord_js_1.ButtonStyle.Danger), new discord_js_1.ButtonBuilder()
                        .setCustomId("guild_leave_cancel")
                        .setLabel("❌ Cancelar")
                        .setStyle(discord_js_1.ButtonStyle.Secondary));
                    const confirmEmbed = new discord_js_1.EmbedBuilder()
                        .setColor("#FF0000")
                        .setTitle("⚠️ Confirmar Saída")
                        .setDescription(`Tem certeza que deseja sair de **${currentGuild.name}**?`)
                        .setFooter({ text: "Esta ação não pode ser desfeita" });
                    await buttonInteraction.reply({
                        embeds: [confirmEmbed],
                        components: [confirmRow],
                        flags: discord_js_1.MessageFlags.Ephemeral,
                    });
                    const leaveReply = await buttonInteraction.fetchReply();
                    const leaveCollector = leaveReply.createMessageComponentCollector({
                        componentType: discord_js_1.ComponentType.Button,
                        time: 60000, // 1 minuto
                    });
                    leaveCollector.on("collect", async (confirmInteraction) => {
                        // Validar se é o usuário correto
                        if (confirmInteraction.user.id !== interaction.user.id) {
                            await confirmInteraction.reply({
                                content: (0, i18n_1.tUser)(confirmInteraction.user.id, "guild_not_your_interaction"),
                                flags: discord_js_1.MessageFlags.Ephemeral,
                            });
                            return;
                        }
                        if (confirmInteraction.customId === "guild_leave_confirm") {
                            const result = (0, guildManager_1.leaveGuild)(interaction.user.id);
                            await confirmInteraction.update({
                                content: result.message,
                                embeds: [],
                                components: [],
                            });
                            guildCollector.stop();
                        }
                        else {
                            await confirmInteraction.update({
                                content: "❌ Saída cancelada.",
                                embeds: [],
                                components: [],
                            });
                        }
                    });
                }
            });
            guildCollector.on("end", async () => {
                try {
                    await guildReply.edit({ components: [] });
                }
                catch (error) {
                    // Mensagem já foi editada ou deletada
                }
            });
        }
        else {
            const welcomeEmbed = new discord_js_1.EmbedBuilder()
                .setColor("#5865F2")
                .setTitle((0, i18n_1.tUser)(interaction.user.id, "guild_welcome_title"))
                .setDescription((0, i18n_1.tUser)(interaction.user.id, "guild_welcome_desc"))
                .setFooter({
                text: (0, i18n_1.tUser)(interaction.user.id, "guild_footer"),
            })
                .setTimestamp();
            const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId("guild_create")
                .setLabel((0, i18n_1.tUser)(interaction.user.id, "guild_btn_create"))
                .setEmoji("⚔️")
                .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
                .setCustomId("guild_join")
                .setLabel((0, i18n_1.tUser)(interaction.user.id, "guild_btn_join"))
                .setEmoji("🏰")
                .setStyle(discord_js_1.ButtonStyle.Primary));
            await interaction.reply({
                embeds: [welcomeEmbed],
                components: [row],
                flags: discord_js_1.MessageFlags.Ephemeral,
            });
            const reply = await interaction.fetchReply();
            const collector = reply.createMessageComponentCollector({
                componentType: discord_js_1.ComponentType.Button,
                time: 300000,
            });
            collector.on("collect", async (i) => {
                if (i.user.id !== interaction.user.id) {
                    await i.reply({
                        content: (0, i18n_1.tUser)(i.user.id, "guild_not_your_interaction"),
                        flags: discord_js_1.MessageFlags.Ephemeral,
                    });
                    return;
                }
                if (i.customId === "guild_create") {
                    const modal = new discord_js_1.ModalBuilder()
                        .setCustomId("guild_create_modal_new")
                        .setTitle((0, i18n_1.tUser)(i.user.id, "guild_create_title"));
                    const nameInput = new discord_js_1.TextInputBuilder()
                        .setCustomId("guild_name")
                        .setLabel((0, i18n_1.tUser)(i.user.id, "guild_create_name"))
                        .setStyle(discord_js_1.TextInputStyle.Short)
                        .setMinLength(3)
                        .setMaxLength(30)
                        .setRequired(true);
                    const descInput = new discord_js_1.TextInputBuilder()
                        .setCustomId("guild_description")
                        .setLabel((0, i18n_1.tUser)(i.user.id, "guild_create_description"))
                        .setStyle(discord_js_1.TextInputStyle.Paragraph)
                        .setMinLength(10)
                        .setMaxLength(200)
                        .setRequired(true);
                    const privacyInput = new discord_js_1.TextInputBuilder()
                        .setCustomId("guild_privacy")
                        .setLabel((0, i18n_1.tUser)(i.user.id, "guild_create_privacy"))
                        .setStyle(discord_js_1.TextInputStyle.Short)
                        .setPlaceholder("pública ou privada")
                        .setMinLength(6)
                        .setMaxLength(10)
                        .setRequired(true);
                    const firstRow = new discord_js_1.ActionRowBuilder().addComponents(nameInput);
                    const secondRow = new discord_js_1.ActionRowBuilder().addComponents(descInput);
                    const thirdRow = new discord_js_1.ActionRowBuilder().addComponents(privacyInput);
                    modal.addComponents(firstRow, secondRow, thirdRow);
                    await i.showModal(modal);
                }
                else if (i.customId === "guild_join") {
                    const guilds = (0, guildManager_1.getAllGuilds)();
                    if (guilds.length === 0) {
                        await i.reply({
                            content: (0, i18n_1.tUser)(i.user.id, "guild_no_guilds"),
                            flags: discord_js_1.MessageFlags.Ephemeral,
                        });
                        return;
                    }
                    const options = guilds.slice(0, 25).map((g) => ({
                        label: g.name,
                        description: `${g.members.length}/${g.settings.maxMembers} ${(0, i18n_1.tUser)(i.user.id, "guild_members")} • ${g.settings.isPublic ? "🔓" : "🔒"} ${g.settings.isPublic ? (0, i18n_1.tUser)(i.user.id, "guild_type_public") : (0, i18n_1.tUser)(i.user.id, "guild_type_private")}`,
                        value: g.id,
                    }));
                    const selectMenu = new discord_js_1.StringSelectMenuBuilder()
                        .setCustomId("guild_select")
                        .setPlaceholder((0, i18n_1.tUser)(i.user.id, "guild_select_placeholder"))
                        .addOptions(options);
                    const selectRow = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
                    await i.reply({
                        content: (0, i18n_1.tUser)(i.user.id, "guild_select_guild"),
                        components: [selectRow],
                        flags: discord_js_1.MessageFlags.Ephemeral,
                    });
                    const selectReply = await i.fetchReply();
                    const selectCollector = selectReply.createMessageComponentCollector({
                        componentType: discord_js_1.ComponentType.StringSelect,
                        time: 60000,
                    });
                    selectCollector.on("collect", async (selectInteraction) => {
                        if (selectInteraction.user.id !== i.user.id) {
                            await selectInteraction.reply({
                                content: (0, i18n_1.tUser)(selectInteraction.user.id, "guild_not_your_interaction"),
                                flags: discord_js_1.MessageFlags.Ephemeral,
                            });
                            return;
                        }
                        const guildId = selectInteraction.values[0];
                        const selectedGuild = guilds.find((g) => g.id === guildId);
                        if (!selectedGuild) {
                            await selectInteraction.reply({
                                content: (0, i18n_1.tUser)(selectInteraction.user.id, "guild_not_found"),
                                flags: discord_js_1.MessageFlags.Ephemeral,
                            });
                            return;
                        }
                        if (selectedGuild.settings.isPublic) {
                            const result = (0, guildManager_1.joinGuild)(selectInteraction.user.id, guildId);
                            await selectInteraction.reply({
                                content: result.message,
                                flags: discord_js_1.MessageFlags.Ephemeral,
                            });
                        }
                        else {
                            const requestResult = (0, guildManager_1.createJoinRequest)(selectInteraction.user.id, guildId);
                            if (!requestResult.success) {
                                await selectInteraction.reply({
                                    content: requestResult.message,
                                    flags: discord_js_1.MessageFlags.Ephemeral,
                                });
                                return;
                            }
                            try {
                                const leader = await interaction.client.users.fetch(selectedGuild.leaderId);
                                const requestEmbed = new discord_js_1.EmbedBuilder()
                                    .setColor("#FFA500")
                                    .setTitle((0, i18n_1.tUser)(leader.id, "guild_request_title"))
                                    .setDescription((0, i18n_1.tUser)(leader.id, "guild_request_desc")
                                    .replace("{user}", `<@${selectInteraction.user.id}>`)
                                    .replace("{guild}", selectedGuild.name))
                                    .addFields({
                                    name: (0, i18n_1.tUser)(leader.id, "guild_request_user"),
                                    value: `<@${selectInteraction.user.id}> (${selectInteraction.user.tag})`,
                                    inline: false,
                                }, {
                                    name: (0, i18n_1.tUser)(leader.id, "guild_request_guild"),
                                    value: selectedGuild.name,
                                    inline: false,
                                })
                                    .setTimestamp();
                                const approveRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                                    .setCustomId(`guild_approve_${requestResult.requestId}`)
                                    .setLabel((0, i18n_1.tUser)(leader.id, "guild_request_approve"))
                                    .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
                                    .setCustomId(`guild_reject_${requestResult.requestId}`)
                                    .setLabel((0, i18n_1.tUser)(leader.id, "guild_request_reject"))
                                    .setStyle(discord_js_1.ButtonStyle.Danger));
                                await leader.send({
                                    embeds: [requestEmbed],
                                    components: [approveRow],
                                });
                                await selectInteraction.reply({
                                    content: requestResult.message,
                                    flags: discord_js_1.MessageFlags.Ephemeral,
                                });
                            }
                            catch (error) {
                                // DM failed - delete the pending request so user can retry
                                if (requestResult.requestId) {
                                    (0, guildManager_1.deleteJoinRequest)(requestResult.requestId);
                                }
                                await selectInteraction.reply({
                                    content: (0, i18n_1.tUser)(selectInteraction.user.id, "guild_request_dm_error"),
                                    flags: discord_js_1.MessageFlags.Ephemeral,
                                });
                            }
                        }
                        selectCollector.stop();
                    });
                    selectCollector.on("end", async (collected) => {
                        if (collected.size === 0) {
                            try {
                                await selectReply.edit({
                                    content: (0, i18n_1.tUser)(i.user.id, "guild_timeout"),
                                    components: [],
                                });
                            }
                            catch (error) {
                                // Mensagem já foi editada ou deletada
                            }
                        }
                    });
                }
            });
            collector.on("end", async (collected) => {
                if (collected.size > 0)
                    return;
                try {
                    await reply.edit({
                        components: [],
                    });
                }
                catch (error) {
                    // Mensagem já foi editada ou deletada
                }
            });
        }
    },
};
//# sourceMappingURL=guilda.js.map