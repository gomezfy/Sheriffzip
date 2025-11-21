"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGuild = createGuild;
exports.getUserGuild = getUserGuild;
exports.getGuildById = getGuildById;
exports.getAllGuilds = getAllGuilds;
exports.getPublicGuilds = getPublicGuilds;
exports.joinGuild = joinGuild;
exports.leaveGuild = leaveGuild;
exports.isUserInGuild = isUserInGuild;
exports.getGuildMemberCount = getGuildMemberCount;
exports.createJoinRequest = createJoinRequest;
exports.approveJoinRequest = approveJoinRequest;
exports.rejectJoinRequest = rejectJoinRequest;
exports.getPendingRequestsForGuild = getPendingRequestsForGuild;
exports.getRequestById = getRequestById;
exports.deleteJoinRequest = deleteJoinRequest;
exports.kickMember = kickMember;
exports.promoteMember = promoteMember;
exports.demoteMember = demoteMember;
exports.getGuildLeaderboard = getGuildLeaderboard;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = require("./database");
const dataManager_1 = require("./dataManager");
const dataDir = (0, database_1.getDataPath)("data");
const guildsFile = path_1.default.join(dataDir, "guilds.json");
const userGuildsFile = path_1.default.join(dataDir, "user-guilds.json");
const joinRequestsFile = path_1.default.join(dataDir, "join-requests.json");
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
if (!fs_1.default.existsSync(guildsFile)) {
    fs_1.default.writeFileSync(guildsFile, JSON.stringify({}, null, 2));
}
if (!fs_1.default.existsSync(userGuildsFile)) {
    fs_1.default.writeFileSync(userGuildsFile, JSON.stringify({}, null, 2));
}
if (!fs_1.default.existsSync(joinRequestsFile)) {
    fs_1.default.writeFileSync(joinRequestsFile, JSON.stringify({}, null, 2));
}
function getGuilds() {
    const data = fs_1.default.readFileSync(guildsFile, "utf8");
    return JSON.parse(data);
}
function saveGuilds(data) {
    fs_1.default.writeFileSync(guildsFile, JSON.stringify(data, null, 2));
}
function getUserGuilds() {
    const data = fs_1.default.readFileSync(userGuildsFile, "utf8");
    return JSON.parse(data);
}
function saveUserGuilds(data) {
    fs_1.default.writeFileSync(userGuildsFile, JSON.stringify(data, null, 2));
}
function getJoinRequests() {
    const data = fs_1.default.readFileSync(joinRequestsFile, "utf8");
    return JSON.parse(data);
}
function saveJoinRequests(data) {
    fs_1.default.writeFileSync(joinRequestsFile, JSON.stringify(data, null, 2));
}
async function createGuild(userId, name, description, isPublic = true) {
    const userGuilds = getUserGuilds();
    if (userGuilds[userId]) {
        return {
            success: false,
            message: "❌ Você já está em uma guilda! Saia da sua guilda atual primeiro.",
        };
    }
    if (name.length < 3 || name.length > 30) {
        return {
            success: false,
            message: "❌ O nome da guilda deve ter entre 3 e 30 caracteres!",
        };
    }
    if (description.length < 10 || description.length > 200) {
        return {
            success: false,
            message: "❌ A descrição deve ter entre 10 e 200 caracteres!",
        };
    }
    const guilds = getGuilds();
    const existingGuild = Object.values(guilds).find((g) => g.name.toLowerCase() === name.toLowerCase());
    if (existingGuild) {
        return {
            success: false,
            message: "❌ Já existe uma guilda com este nome! Escolha outro.",
        };
    }
    // Deduzir 1000 Saloon Tokens
    const removeResult = await (0, dataManager_1.removeUserGold)(userId, 1000);
    if (!removeResult.success) {
        return {
            success: false,
            message: "❌ Você não tem tokens suficientes para criar uma guilda! Custo: 1000 🎫 Saloon Tokens.",
        };
    }
    const guildId = `guild_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newGuild = {
        id: guildId,
        name: name.trim(),
        description: description.trim(),
        leaderId: userId,
        createdAt: Date.now(),
        members: [
            {
                userId: userId,
                joinedAt: Date.now(),
                role: "leader",
            },
        ],
        level: 1,
        xp: 0,
        settings: {
            maxMembers: 20,
            isPublic: isPublic,
            requireApproval: !isPublic,
        },
    };
    guilds[guildId] = newGuild;
    userGuilds[userId] = guildId;
    saveGuilds(guilds);
    saveUserGuilds(userGuilds);
    return {
        success: true,
        message: `✅ Guilda **${name}** criada com sucesso!\n💰 ${1000} 🎫 Saloon Tokens deduzidos.`,
        guild: newGuild,
    };
}
function getUserGuild(userId) {
    const userGuilds = getUserGuilds();
    const guildId = userGuilds[userId];
    if (!guildId) {
        return null;
    }
    const guilds = getGuilds();
    return guilds[guildId] || null;
}
function getGuildById(guildId) {
    const guilds = getGuilds();
    return guilds[guildId] || null;
}
function getAllGuilds() {
    const guilds = getGuilds();
    return Object.values(guilds);
}
function getPublicGuilds() {
    const guilds = getAllGuilds();
    return guilds.filter((g) => g.settings.isPublic);
}
function joinGuild(userId, guildId) {
    const userGuilds = getUserGuilds();
    if (userGuilds[userId]) {
        return {
            success: false,
            message: "❌ Você já está em uma guilda! Saia da sua guilda atual primeiro.",
        };
    }
    const guilds = getGuilds();
    const guild = guilds[guildId];
    if (!guild) {
        return {
            success: false,
            message: "❌ Guilda não encontrada!",
        };
    }
    if (guild.members.length >= guild.settings.maxMembers) {
        return {
            success: false,
            message: "❌ Esta guilda está cheia! Tente outra.",
        };
    }
    guild.members.push({
        userId: userId,
        joinedAt: Date.now(),
        role: "member",
    });
    userGuilds[userId] = guildId;
    guilds[guildId] = guild;
    saveGuilds(guilds);
    saveUserGuilds(userGuilds);
    return {
        success: true,
        message: `✅ Você entrou na guilda **${guild.name}**!`,
        guild: guild,
    };
}
function leaveGuild(userId) {
    const userGuilds = getUserGuilds();
    const guildId = userGuilds[userId];
    if (!guildId) {
        return {
            success: false,
            message: "❌ Você não está em nenhuma guilda!",
        };
    }
    const guilds = getGuilds();
    const guild = guilds[guildId];
    if (!guild) {
        return {
            success: false,
            message: "❌ Guilda não encontrada!",
        };
    }
    if (guild.leaderId === userId) {
        if (guild.members.length > 1) {
            return {
                success: false,
                message: "❌ Você é o líder! Transfira a liderança ou dissolva a guilda antes de sair.",
            };
        }
        else {
            delete guilds[guildId];
        }
    }
    else {
        guild.members = guild.members.filter((m) => m.userId !== userId);
        guilds[guildId] = guild;
    }
    delete userGuilds[userId];
    saveGuilds(guilds);
    saveUserGuilds(userGuilds);
    return {
        success: true,
        message: `✅ Você saiu da guilda **${guild.name}**!`,
    };
}
function isUserInGuild(userId) {
    const userGuilds = getUserGuilds();
    return !!userGuilds[userId];
}
function getGuildMemberCount(guildId) {
    const guild = getGuildById(guildId);
    return guild ? guild.members.length : 0;
}
function createJoinRequest(userId, guildId) {
    const userGuilds = getUserGuilds();
    if (userGuilds[userId]) {
        return {
            success: false,
            message: "❌ Você já está em uma guilda!",
        };
    }
    const guild = getGuildById(guildId);
    if (!guild) {
        return {
            success: false,
            message: "❌ Guilda não encontrada!",
        };
    }
    if (guild.members.length >= guild.settings.maxMembers) {
        return {
            success: false,
            message: "❌ Esta guilda está cheia!",
        };
    }
    const requests = getJoinRequests();
    const existingRequest = Object.values(requests).find((r) => r.userId === userId && r.guildId === guildId && r.status === "pending");
    if (existingRequest) {
        return {
            success: false,
            message: "⏳ Você já tem um pedido pendente para esta guilda!",
        };
    }
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newRequest = {
        id: requestId,
        userId: userId,
        guildId: guildId,
        requestedAt: Date.now(),
        status: "pending",
    };
    requests[requestId] = newRequest;
    saveJoinRequests(requests);
    return {
        success: true,
        message: `✅ Pedido enviado para o líder da guilda **${guild.name}**!`,
        requestId: requestId,
    };
}
function approveJoinRequest(requestId) {
    const requests = getJoinRequests();
    const request = requests[requestId];
    if (!request) {
        return {
            success: false,
            message: "❌ Pedido não encontrado!",
        };
    }
    if (request.status !== "pending") {
        return {
            success: false,
            message: "❌ Este pedido já foi processado!",
        };
    }
    const result = joinGuild(request.userId, request.guildId);
    if (result.success) {
        request.status = "approved";
        requests[requestId] = request;
        saveJoinRequests(requests);
    }
    else {
        // Se joinGuild falhou (guilda cheia ou usuário já em outra guilda),
        // marcar como rejected para não ficar pendente
        request.status = "rejected";
        requests[requestId] = request;
        saveJoinRequests(requests);
    }
    return result;
}
function rejectJoinRequest(requestId) {
    const requests = getJoinRequests();
    const request = requests[requestId];
    if (!request) {
        return {
            success: false,
            message: "❌ Pedido não encontrado!",
        };
    }
    if (request.status !== "pending") {
        return {
            success: false,
            message: "❌ Este pedido já foi processado!",
        };
    }
    const guild = getGuildById(request.guildId);
    if (!guild) {
        return {
            success: false,
            message: "❌ Guilda não encontrada!",
        };
    }
    request.status = "rejected";
    requests[requestId] = request;
    saveJoinRequests(requests);
    return {
        success: true,
        message: `✅ Pedido recusado!`,
        userId: request.userId,
        guildName: guild.name,
    };
}
function getPendingRequestsForGuild(guildId) {
    const requests = getJoinRequests();
    return Object.values(requests).filter((r) => r.guildId === guildId && r.status === "pending");
}
function getRequestById(requestId) {
    const requests = getJoinRequests();
    return requests[requestId] || null;
}
function deleteJoinRequest(requestId) {
    const requests = getJoinRequests();
    if (!requests[requestId]) {
        return false;
    }
    delete requests[requestId];
    saveJoinRequests(requests);
    return true;
}
function kickMember(kickerId, targetId) {
    const userGuilds = getUserGuilds();
    const guildId = userGuilds[kickerId];
    if (!guildId) {
        return {
            success: false,
            message: "❌ Você não está em nenhuma guilda!",
        };
    }
    const guilds = getGuilds();
    const guild = guilds[guildId];
    if (!guild) {
        return {
            success: false,
            message: "❌ Guilda não encontrada!",
        };
    }
    // Verificar se o kicker é líder ou co-líder
    const kickerMember = guild.members.find((m) => m.userId === kickerId);
    if (!kickerMember ||
        (kickerMember.role !== "leader" && kickerMember.role !== "co-leader")) {
        return {
            success: false,
            message: "❌ Apenas o líder ou co-líder pode expulsar membros!",
        };
    }
    // Verificar se o alvo está na guilda
    const targetMember = guild.members.find((m) => m.userId === targetId);
    if (!targetMember) {
        return {
            success: false,
            message: "❌ Este usuário não está na guilda!",
        };
    }
    // Não pode expulsar o líder
    if (targetMember.role === "leader") {
        return {
            success: false,
            message: "❌ Não é possível expulsar o líder da guilda!",
        };
    }
    // Co-líder não pode expulsar outro co-líder
    if (kickerMember.role === "co-leader" && targetMember.role === "co-leader") {
        return {
            success: false,
            message: "❌ Co-líderes não podem expulsar outros co-líderes!",
        };
    }
    // Não pode se expulsar
    if (kickerId === targetId) {
        return {
            success: false,
            message: '❌ Você não pode se expulsar! Use o botão "Sair da Guilda".',
        };
    }
    // Remover o membro
    guild.members = guild.members.filter((m) => m.userId !== targetId);
    delete userGuilds[targetId];
    guilds[guildId] = guild;
    saveGuilds(guilds);
    saveUserGuilds(userGuilds);
    return {
        success: true,
        message: `✅ <@${targetId}> foi expulso da guilda!`,
        guild: guild,
    };
}
function promoteMember(leaderId, targetId) {
    const userGuilds = getUserGuilds();
    const guildId = userGuilds[leaderId];
    if (!guildId) {
        return {
            success: false,
            message: "❌ Você não está em nenhuma guilda!",
        };
    }
    const guilds = getGuilds();
    const guild = guilds[guildId];
    if (!guild) {
        return {
            success: false,
            message: "❌ Guilda não encontrada!",
        };
    }
    // Apenas o líder pode promover
    if (guild.leaderId !== leaderId) {
        return {
            success: false,
            message: "❌ Apenas o líder pode promover membros!",
        };
    }
    // Verificar se o alvo está na guilda
    const targetMember = guild.members.find((m) => m.userId === targetId);
    if (!targetMember) {
        return {
            success: false,
            message: "❌ Este usuário não está na guilda!",
        };
    }
    // Verificar se já é co-líder ou líder
    if (targetMember.role === "co-leader") {
        return {
            success: false,
            message: "❌ Este membro já é co-líder!",
        };
    }
    if (targetMember.role === "leader") {
        return {
            success: false,
            message: "❌ Este membro já é o líder!",
        };
    }
    // Promover para co-líder
    guild.members = guild.members.map((m) => m.userId === targetId ? { ...m, role: "co-leader" } : m);
    guilds[guildId] = guild;
    saveGuilds(guilds);
    return {
        success: true,
        message: `✅ <@${targetId}> foi promovido a co-líder!`,
        guild: guild,
    };
}
function demoteMember(leaderId, targetId) {
    const userGuilds = getUserGuilds();
    const guildId = userGuilds[leaderId];
    if (!guildId) {
        return {
            success: false,
            message: "❌ Você não está em nenhuma guilda!",
        };
    }
    const guilds = getGuilds();
    const guild = guilds[guildId];
    if (!guild) {
        return {
            success: false,
            message: "❌ Guilda não encontrada!",
        };
    }
    // Apenas o líder pode rebaixar
    if (guild.leaderId !== leaderId) {
        return {
            success: false,
            message: "❌ Apenas o líder pode rebaixar membros!",
        };
    }
    // Verificar se o alvo está na guilda
    const targetMember = guild.members.find((m) => m.userId === targetId);
    if (!targetMember) {
        return {
            success: false,
            message: "❌ Este usuário não está na guilda!",
        };
    }
    // Verificar se é co-líder
    if (targetMember.role !== "co-leader") {
        return {
            success: false,
            message: "❌ Este membro não é um co-líder!",
        };
    }
    // Rebaixar para membro
    guild.members = guild.members.map((m) => m.userId === targetId ? { ...m, role: "member" } : m);
    guilds[guildId] = guild;
    saveGuilds(guilds);
    return {
        success: true,
        message: `✅ <@${targetId}> foi rebaixado a membro!`,
        guild: guild,
    };
}
function getGuildLeaderboard(limit = 10) {
    const guilds = getGuilds();
    const guildArray = Object.entries(guilds).map(([id, guild]) => ({
        guildId: id,
        guild: guild,
        score: guild.level * 1000 + guild.xp,
    }));
    return guildArray.sort((a, b) => b.score - a.score).slice(0, limit);
}
//# sourceMappingURL=guildManager.js.map