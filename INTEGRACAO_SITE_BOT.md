# 🔗 Integração entre Site e Bot

Este documento explica como o **site de eventos** (VetraCloud) e o **bot Discord** (ShardCloud) se comunicam.

## 📊 Arquitetura

```
┌─────────────────┐         HTTP/API         ┌─────────────────┐
│   Site Web      │ ──────────────────────> │   Bot Discord   │
│  (VetraCloud)   │                          │  (ShardCloud)   │
│                 │ <────────────────────── │                 │
│  - Rankings     │      JSON Response       │  - Eventos      │
│  - Prêmios      │                          │  - Database     │
│  - Dashboard    │                          │  - Comandos     │
└─────────────────┘                          └─────────────────┘
```

## 🔌 Conexão

O site se conecta ao bot através de variável de ambiente:

```env
# No site (VetraCloud)
BOT_API_URL=https://seu-bot.shardcloud.app
```

O site faz requisições HTTP para os endpoints do bot.

## 📡 Endpoints Necessários no Bot

O bot **DEVE** expor os seguintes endpoints:

### 1. `GET /api/events`

Retorna dados dos eventos em andamento.

**Exemplo de resposta:**
```json
{
  "currentEvent": {
    "type": "mining",
    "name": "Corrida do Ouro",
    "startTime": "2024-01-20T00:00:00.000Z",
    "endTime": "2024-01-20T23:59:59.000Z"
  },
  "huntingEvent": {
    "type": "hunting",
    "name": "Grande Caçada",
    "startTime": "2024-01-21T00:00:00.000Z",
    "endTime": "2024-01-21T23:59:59.000Z"
  },
  "leaderboard": [
    {
      "rank": 1,
      "userId": "123456789",
      "username": "CowboyJoe",
      "score": 15000,
      "avatar": "https://cdn.discordapp.com/avatars/..."
    }
  ],
  "huntingLeaderboard": [
    {
      "rank": 1,
      "userId": "987654321",
      "username": "HunterMike",
      "score": 8500,
      "avatar": "https://cdn.discordapp.com/avatars/..."
    }
  ],
  "prizes": [
    { "position": 1, "silver": 300000, "tokens": 300, "xp": 3500 },
    { "position": 2, "silver": 200000, "tokens": 200, "xp": 1750 }
  ],
  "huntingPrizes": [
    { "position": 1, "silver": 250000, "tokens": 250, "xp": 3000 },
    { "position": 2, "silver": 150000, "tokens": 150, "xp": 1500 }
  ],
  "nextEvent": {
    "date": "2024-01-28T00:00:00.000Z",
    "timeUntil": 604800000
  }
}
```

### 2. `GET /api/emojis`

Retorna os emojis customizados do bot.

**Exemplo de resposta:**
```json
{
  "trophy": "<:trophy:1234567890>",
  "pickaxe": "<:pickaxe:1234567891>",
  "gold_medal": "<:gold_medal:1234567892>",
  "silver_medal": "<:silver_medal:1234567893>",
  "bronze_medal": "<:bronze_medal:1234567894>",
  "silver_coin": "<:silver_coin:1234567895>",
  "saloon_token": "<:saloon_token:1234567896>"
}
```

### 3. `GET /health` (Recomendado)

Health check para monitoramento.

**Exemplo de resposta:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T12:00:00.000Z",
  "uptime": 86400
}
```

## ⚙️ Implementação no Bot

O bot precisa ter um servidor HTTP Express rodando. Exemplo:

```javascript
// src/linked-roles-server.ts ou similar
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint de eventos
app.get('/api/events', async (req, res) => {
  // Buscar dados do banco de dados
  const eventData = await getEventData();
  res.json(eventData);
});

// Endpoint de emojis
app.get('/api/emojis', (req, res) => {
  res.json({
    trophy: '<:trophy:1234567890>',
    // ... outros emojis
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});
```

## 🔒 Segurança

### CORS

O bot **DEVE** permitir requisições do site. Configure CORS:

```javascript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://seu-site.vertracloud.app',
    'http://localhost:5000' // para desenvolvimento
  ]
}));
```

### Rate Limiting (Opcional)

Para proteger as APIs:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 60 // 60 requisições por minuto
});

app.use('/api/', limiter);
```

## 🧪 Testando a Integração

### 1. Testar o Bot Localmente

```bash
# No diretório do bot
npm run dev
```

Acesse: `http://localhost:3000/api/events`

Deve retornar JSON com os dados.

### 2. Testar o Site Localmente

```bash
# No diretório web-server/
BOT_API_URL=http://localhost:3000 npm start
```

Acesse: `http://localhost:5000/events.html`

Os dados do bot devem aparecer.

### 3. Testar em Produção

Após deploy:

```bash
# Testar API do bot
curl https://seu-bot.shardcloud.app/api/events

# Acessar site
# Browser: https://seu-site.vertracloud.app/events.html
```

## 🐛 Solução de Problemas

### ❌ Site mostra dados mockados

**Causas:**
1. `BOT_API_URL` não configurado
2. Bot não está online
3. Bot não expõe as APIs
4. CORS bloqueando requisições

**Diagnóstico:**
```bash
# Teste se o bot responde
curl https://seu-bot.shardcloud.app/api/events

# Verifique logs do site
# Procure por erros tipo "CORS" ou "Failed to fetch"
```

**Solução:**
1. Configure `BOT_API_URL` corretamente no site
2. Verifique se o bot está online no ShardCloud
3. Adicione os endpoints ao bot
4. Configure CORS no bot

### ❌ Erro: "net::ERR_CONNECTION_REFUSED"

**Causa:** Bot não está acessível na URL configurada.

**Solução:**
1. Confirme que o bot está rodando
2. Verifique a URL: `https://seu-bot.shardcloud.app`
3. Teste no browser: acesse `/api/events` diretamente

### ❌ Erro: "CORS policy blocked"

**Causa:** Bot não permite requisições do site.

**Solução:** Configure CORS no bot (veja seção Segurança).

### ❌ Dados aparecem mas emojis não

**Causa:** Endpoint `/api/emojis` não implementado ou retornando dados incorretos.

**Solução:**
1. Implemente o endpoint no bot
2. Retorne emojis no formato `<:nome:id>` ou emojis Unicode

## 📋 Checklist de Integração

### No Bot (ShardCloud):
- [ ] Servidor HTTP Express configurado
- [ ] Endpoint `/api/events` implementado
- [ ] Endpoint `/api/emojis` implementado
- [ ] CORS configurado permitindo origem do site
- [ ] Bot expõe porta (ex: 3000)
- [ ] Endpoints acessíveis publicamente

### No Site (VetraCloud):
- [ ] Variável `BOT_API_URL` configurada
- [ ] URL aponta para o bot correto
- [ ] Site faz requisições aos endpoints corretos
- [ ] Tratamento de erro caso bot esteja offline

### Testes:
- [ ] `/api/events` retorna JSON válido
- [ ] `/api/emojis` retorna emojis
- [ ] Site carrega dados do bot
- [ ] Rankings aparecem corretamente
- [ ] Emojis customizados aparecem

## 🔄 Fluxo de Dados

1. **Usuário acessa o site:** `https://seu-site.vertracloud.app/events.html`
2. **Site carrega** e executa JavaScript
3. **JavaScript faz requisição:** `fetch('/api/events')`
4. **Site (servidor Express) recebe** e faz proxy: `axios.get(BOT_API_URL + '/api/events')`
5. **Bot responde** com dados do banco de dados
6. **Site retorna** JSON para o navegador
7. **JavaScript renderiza** os dados na página

## 🎯 Modo Standalone

Se o bot não estiver disponível, o site funcionará em **modo demonstração**:

```env
# Sem BOT_API_URL, o site usa dados mockados
BOT_API_URL=
```

Isso é útil para:
- Desenvolvimento do site sem depender do bot
- Demonstrações
- Testes de interface

## 🚀 Próximos Passos

Após configurar a integração:

1. **Monitorar logs** de ambos os serviços
2. **Configurar alertas** se o bot ficar offline
3. **Implementar cache** no site (opcional) para reduzir requisições
4. **Adicionar mais endpoints** conforme necessário

## 🆘 Suporte

Se tiver problemas:
1. Verifique os logs do bot e do site
2. Teste os endpoints manualmente com `curl`
3. Consulte os guias:
   - `web-server/DEPLOY_VERTRACLOUD.md`
   - `DEPLOY_SHARDCLOUD.md`

---

**Integração Site ↔ Bot** 🔗
