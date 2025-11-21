"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVER_TEMPLATES = void 0;
exports.getTemplateById = getTemplateById;
exports.getAllTemplates = getAllTemplates;
const discord_js_1 = require("discord.js");
exports.SERVER_TEMPLATES = [
    {
        id: "gaming",
        name: "Gaming Community",
        description: "Servidor completo para comunidade de jogos com canais de voz, texto e anúncios",
        emoji: "🎮",
        roles: [
            {
                name: "👑 Owner",
                color: 0xffd700,
                permissions: [discord_js_1.PermissionFlagsBits.Administrator],
                hoist: true,
            },
            {
                name: "🛡️ Moderador",
                color: 0x00ff00,
                permissions: [
                    discord_js_1.PermissionFlagsBits.ManageMessages,
                    discord_js_1.PermissionFlagsBits.KickMembers,
                    discord_js_1.PermissionFlagsBits.BanMembers,
                    discord_js_1.PermissionFlagsBits.ModerateMembers,
                ],
                hoist: true,
            },
            {
                name: "⭐ VIP",
                color: 0xff00ff,
                permissions: [],
                hoist: true,
            },
            {
                name: "🎮 Gamer",
                color: 0x808080,
                permissions: [],
                hoist: false,
            },
        ],
        categories: [
            {
                name: "📋 INFORMAÇÕES",
                channels: [
                    {
                        name: "bem-vindo",
                        type: discord_js_1.ChannelType.GuildAnnouncement,
                        topic: "👋 Bem-vindo ao servidor! Leia as regras e divirta-se!",
                    },
                    {
                        name: "regras",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "📜 Regras do servidor - Leia com atenção!",
                    },
                    {
                        name: "anúncios",
                        type: discord_js_1.ChannelType.GuildAnnouncement,
                        topic: "📢 Anúncios importantes do servidor",
                    },
                ],
            },
            {
                name: "💬 GERAL",
                channels: [
                    {
                        name: "chat-geral",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "💭 Converse sobre qualquer assunto",
                    },
                    {
                        name: "bot-comandos",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "🤖 Use comandos de bots aqui",
                    },
                    {
                        name: "memes",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "😂 Compartilhe memes e diversão",
                    },
                ],
            },
            {
                name: "🎮 GAMING",
                channels: [
                    {
                        name: "chat-gaming",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "🎮 Fale sobre jogos",
                    },
                    {
                        name: "procurar-grupo",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "🔍 Encontre pessoas para jogar",
                    },
                    {
                        name: "clips-e-highlights",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "🎬 Compartilhe suas melhores jogadas",
                    },
                ],
            },
            {
                name: "🔊 CANAIS DE VOZ",
                channels: [
                    {
                        name: "🎧 Lobby",
                        type: discord_js_1.ChannelType.GuildVoice,
                    },
                    {
                        name: "🎮 Gaming 1",
                        type: discord_js_1.ChannelType.GuildVoice,
                    },
                    {
                        name: "🎮 Gaming 2",
                        type: discord_js_1.ChannelType.GuildVoice,
                    },
                    {
                        name: "😴 AFK",
                        type: discord_js_1.ChannelType.GuildVoice,
                    },
                ],
            },
        ],
    },
    {
        id: "community",
        name: "Comunidade Geral",
        description: "Servidor versátil para comunidades gerais com foco em socialização",
        emoji: "👥",
        roles: [
            {
                name: "👑 Administrador",
                color: 0xff0000,
                permissions: [discord_js_1.PermissionFlagsBits.Administrator],
                hoist: true,
            },
            {
                name: "🛡️ Staff",
                color: 0x3498db,
                permissions: [
                    discord_js_1.PermissionFlagsBits.ManageMessages,
                    discord_js_1.PermissionFlagsBits.KickMembers,
                ],
                hoist: true,
            },
            {
                name: "💎 Apoiador",
                color: 0x9b59b6,
                permissions: [],
                hoist: true,
            },
            {
                name: "👤 Membro",
                color: 0x95a5a6,
                permissions: [],
                hoist: false,
            },
        ],
        categories: [
            {
                name: "📌 INÍCIO",
                channels: [
                    {
                        name: "apresente-se",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "👋 Se apresente para a comunidade!",
                    },
                    {
                        name: "regras",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "📜 Regras da comunidade",
                    },
                    {
                        name: "novidades",
                        type: discord_js_1.ChannelType.GuildAnnouncement,
                        topic: "🎉 Novidades e atualizações",
                    },
                ],
            },
            {
                name: "💬 CONVERSAS",
                channels: [
                    {
                        name: "bate-papo",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "💭 Conversas gerais",
                    },
                    {
                        name: "debates",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "🗣️ Debates e discussões",
                    },
                    {
                        name: "sugestões",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "💡 Dê suas sugestões",
                    },
                ],
            },
            {
                name: "🎨 CRIATIVIDADE",
                channels: [
                    {
                        name: "arte",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "🎨 Compartilhe suas artes",
                    },
                    {
                        name: "música",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "🎵 Compartilhe músicas",
                    },
                    {
                        name: "projetos",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "💼 Mostre seus projetos",
                    },
                ],
            },
            {
                name: "🔊 VOZ",
                channels: [
                    {
                        name: "🎤 Sala Principal",
                        type: discord_js_1.ChannelType.GuildVoice,
                    },
                    {
                        name: "🎵 Música",
                        type: discord_js_1.ChannelType.GuildVoice,
                    },
                    {
                        name: "🎮 Jogos",
                        type: discord_js_1.ChannelType.GuildVoice,
                    },
                ],
            },
        ],
    },
    {
        id: "study",
        name: "Estudos & Educação",
        description: "Servidor focado em educação, estudos e compartilhamento de conhecimento",
        emoji: "📚",
        roles: [
            {
                name: "👨‍🏫 Professor",
                color: 0x2ecc71,
                permissions: [
                    discord_js_1.PermissionFlagsBits.ManageMessages,
                    discord_js_1.PermissionFlagsBits.ManageChannels,
                ],
                hoist: true,
            },
            {
                name: "🎓 Monitor",
                color: 0x3498db,
                permissions: [discord_js_1.PermissionFlagsBits.ManageMessages],
                hoist: true,
            },
            {
                name: "📖 Estudante",
                color: 0x95a5a6,
                permissions: [],
                hoist: false,
            },
        ],
        categories: [
            {
                name: "📋 INFORMAÇÕES",
                channels: [
                    {
                        name: "bem-vindo",
                        type: discord_js_1.ChannelType.GuildAnnouncement,
                        topic: "👋 Seja bem-vindo ao servidor de estudos!",
                    },
                    {
                        name: "diretrizes",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "📜 Diretrizes e regras de conduta",
                    },
                    {
                        name: "avisos",
                        type: discord_js_1.ChannelType.GuildAnnouncement,
                        topic: "📢 Avisos importantes",
                    },
                ],
            },
            {
                name: "📚 ESTUDOS",
                channels: [
                    {
                        name: "matemática",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "➗ Dúvidas e discussões de matemática",
                    },
                    {
                        name: "programação",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "💻 Programação e tecnologia",
                    },
                    {
                        name: "idiomas",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "🌍 Aprendizado de idiomas",
                    },
                    {
                        name: "recursos",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "📑 Compartilhe materiais de estudo",
                    },
                ],
            },
            {
                name: "💡 AJUDA",
                channels: [
                    {
                        name: "dúvidas",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "❓ Tire suas dúvidas",
                    },
                    {
                        name: "projetos",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "🚀 Compartilhe projetos e trabalhos",
                    },
                ],
            },
            {
                name: "🔊 SALAS DE ESTUDO",
                channels: [
                    {
                        name: "📖 Sala Silenciosa",
                        type: discord_js_1.ChannelType.GuildVoice,
                    },
                    {
                        name: "👥 Grupo de Estudos",
                        type: discord_js_1.ChannelType.GuildVoice,
                    },
                    {
                        name: "🎤 Discussões",
                        type: discord_js_1.ChannelType.GuildVoice,
                    },
                ],
            },
        ],
    },
    {
        id: "business",
        name: "Negócios & Profissional",
        description: "Servidor profissional para negócios, networking e produtividade",
        emoji: "💼",
        roles: [
            {
                name: "👔 CEO",
                color: 0x000000,
                permissions: [discord_js_1.PermissionFlagsBits.Administrator],
                hoist: true,
            },
            {
                name: "💼 Gerente",
                color: 0x1f8b4c,
                permissions: [
                    discord_js_1.PermissionFlagsBits.ManageChannels,
                    discord_js_1.PermissionFlagsBits.ManageMessages,
                ],
                hoist: true,
            },
            {
                name: "👨‍💼 Profissional",
                color: 0x3498db,
                permissions: [],
                hoist: true,
            },
            {
                name: "🤝 Parceiro",
                color: 0x95a5a6,
                permissions: [],
                hoist: false,
            },
        ],
        categories: [
            {
                name: "📋 CORPORATIVO",
                channels: [
                    {
                        name: "anúncios",
                        type: discord_js_1.ChannelType.GuildAnnouncement,
                        topic: "📢 Anúncios oficiais da empresa",
                    },
                    {
                        name: "geral",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "💬 Comunicação geral",
                    },
                    {
                        name: "recursos-humanos",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "👥 RH e gestão de pessoas",
                    },
                ],
            },
            {
                name: "💡 PROJETOS",
                channels: [
                    {
                        name: "planejamento",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "📊 Planejamento de projetos",
                    },
                    {
                        name: "desenvolvimento",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "⚙️ Desenvolvimento e execução",
                    },
                    {
                        name: "relatórios",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "📈 Relatórios e resultados",
                    },
                ],
            },
            {
                name: "🤝 NETWORKING",
                channels: [
                    {
                        name: "apresentações",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "👋 Apresente-se profissionalmente",
                    },
                    {
                        name: "oportunidades",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "💼 Oportunidades de negócios",
                    },
                ],
            },
            {
                name: "🔊 REUNIÕES",
                channels: [
                    {
                        name: "📞 Sala de Reunião 1",
                        type: discord_js_1.ChannelType.GuildVoice,
                    },
                    {
                        name: "📞 Sala de Reunião 2",
                        type: discord_js_1.ChannelType.GuildVoice,
                    },
                ],
            },
        ],
    },
    {
        id: "minimal",
        name: "Minimalista",
        description: "Servidor simples e clean com o essencial para começar",
        emoji: "✨",
        roles: [
            {
                name: "👑 Admin",
                color: 0xe74c3c,
                permissions: [discord_js_1.PermissionFlagsBits.Administrator],
                hoist: true,
            },
            {
                name: "👤 Membro",
                color: 0x95a5a6,
                permissions: [],
                hoist: false,
            },
        ],
        categories: [
            {
                name: "📌 PRINCIPAL",
                channels: [
                    {
                        name: "regras",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "📜 Regras do servidor",
                    },
                    {
                        name: "geral",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "💬 Chat geral",
                    },
                    {
                        name: "comandos",
                        type: discord_js_1.ChannelType.GuildText,
                        topic: "🤖 Use bots aqui",
                    },
                ],
            },
            {
                name: "🔊 VOZ",
                channels: [
                    {
                        name: "🎤 Voz Geral",
                        type: discord_js_1.ChannelType.GuildVoice,
                    },
                ],
            },
        ],
    },
];
function getTemplateById(id) {
    return exports.SERVER_TEMPLATES.find((t) => t.id === id);
}
function getAllTemplates() {
    return exports.SERVER_TEMPLATES;
}
//# sourceMappingURL=serverTemplates.js.map