# 🤖 Deploy do Bot no ShardCloud

Este guia mostra como hospedar **apenas o bot Discord** no ShardCloud, separado do site.

## 📋 O que você vai hospedar

O bot Discord Sheriff Rex com:
- 46+ comandos slash
- Sistema de economia
- Jogos (mineração, caça, cassino)
- Eventos automáticos
- Sistema de perfis e rankings

## ✅ Pré-requisitos

1. Conta criada no [ShardCloud](https://shardcloud.gg)
2. Bot Discord criado no [Discord Developer Portal](https://discord.com/developers/applications)
3. Token do bot (`DISCORD_TOKEN`)
4. Client ID do bot (`DISCORD_CLIENT_ID`)
5. Seu User ID do Discord (`OWNER_ID`)
6. Banco de dados PostgreSQL (Neon, Supabase, ou outro)

## 📁 Arquivos Necessários

Você precisa fazer upload de **todo o projeto**, **EXCETO** a pasta `web-server/`:

```
├── src/              ✅ (código do bot)
├── assets/           ✅ (imagens, ícones)
├── database/         ✅ (migrations)
├── scripts/          ✅ (scripts auxiliares)
├── package.json      ✅
├── tsconfig.json     ✅
├── drizzle.config.ts ✅
└── web-server/       ❌ (NÃO ENVIAR - vai pro VetraCloud)
```

## 🚀 Passo a Passo

### 1️⃣ Preparar o Projeto

Remova a pasta `web-server/` do projeto antes do upload:

```bash
# Opcional: criar cópia sem web-server
mkdir sheriff-bot-only
cp -r src/ assets/ database/ scripts/ package.json tsconfig.json drizzle.config.ts sheriff-bot-only/
```

### 2️⃣ Configurar Variáveis de Ambiente

No painel do ShardCloud, adicione as seguintes variáveis:

#### **Obrigatórias:**
```env
DISCORD_TOKEN=seu_token_do_discord
DISCORD_CLIENT_ID=seu_client_id
CLIENT_ID=seu_client_id
OWNER_ID=seu_user_id_discord
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
```

#### **Recomendadas:**
```env
LOW_MEMORY=true
MEMORY_LIMIT=512
```

#### **Opcionais (se você usa):**
```env
OPENROUTER_API_KEY=sua_key_openrouter
STRIPE_SECRET_KEY=sua_key_stripe
SESSION_SECRET=secret_aleatorio
MERCADOPAGO_ACCESS_TOKEN=seu_token_mp
```

### 3️⃣ Upload do Código

**Opção A: Via GitHub**
1. Crie um repositório **sem** a pasta `web-server/`
2. Adicione ao `.gitignore`:
   ```
   web-server/
   ```
3. Faça push para o GitHub
4. No ShardCloud, conecte o repositório

**Opção B: Via Upload Direto**
1. Compacte o projeto (sem `web-server/`)
2. Faça upload no painel do ShardCloud

### 4️⃣ Configurar Comandos de Build e Start

No painel do ShardCloud:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm run start:shard
```

**Comandos alternativos (se houver problemas de memória):**
```bash
# Ultra low memory (64MB)
npm run start:low-memory

# Low memory (512MB)
npm run start

# Com sharding (se tiver muitos servidores)
npm run start:shard
```

### 5️⃣ Configurar Banco de Dados

O bot usa PostgreSQL. Recomendações:

**Opção A: Neon (Recomendado - Grátis)**
1. Crie conta em [neon.tech](https://neon.tech)
2. Crie um banco de dados
3. Copie a `DATABASE_URL`
4. Adicione nas variáveis de ambiente do ShardCloud

**Opção B: Supabase (Grátis)**
1. Crie conta em [supabase.com](https://supabase.com)
2. Crie projeto
3. Vá em Settings > Database
4. Copie a Connection String (URI)
5. Adicione como `DATABASE_URL`

**Opção C: Railway / Render**
- Mesma lógica: crie o banco e copie a URL de conexão

### 6️⃣ Registrar Comandos do Discord

Após o primeiro deploy, registre os comandos slash:

**Método 1: Via ShardCloud Console** (se disponível)
```bash
npm run deploy:prod
```

**Método 2: Localmente** (recomendado)
```bash
# No seu computador, crie arquivo .env:
DISCORD_TOKEN=seu_token
DISCORD_CLIENT_ID=seu_client_id
DATABASE_URL=sua_database_url

# Execute:
npm run deploy
```

Você verá uma mensagem confirmando o registro dos comandos.

### 7️⃣ Expor APIs para o Site

O bot precisa expor endpoints para o site consumir. Verifique se o arquivo `src/linked-roles-server.ts` ou similar está configurado.

**APIs necessárias:**
- `GET /api/events` - Dados dos eventos em andamento
- `GET /api/emojis` - Emojis customizados do servidor

**Porta recomendada:** 3000 (configurável via `PORT`)

Se estas APIs não existirem, você precisará criá-las.

### 8️⃣ Iniciar o Bot

1. Clique em "Deploy" no ShardCloud
2. Aguarde a instalação e build
3. O bot iniciará automaticamente

## 🔍 Verificar se Funcionou

### Bot Online
No Discord, o bot deve aparecer online:
- Status: 🟢 Online
- Nome: Sheriff Rex
- Avatar: Ícone do xerife

### Comandos Funcionando
Teste um comando simples:
```
/ping
```

Deve retornar a latência do bot.

### APIs Funcionando
Acesse via browser (substitua pela URL do ShardCloud):
```
https://seu-bot.shardcloud.app/api/events
```

Deve retornar JSON com dados dos eventos.

## 📊 Monitoramento

### Logs
No painel do ShardCloud, verifique os logs. Procure por:

```
✅ Database system ready
✅ Loaded 46 commands
✅ Bot online as Sheriff Rex#1234
🌐 API server running on port 3000
```

### Comandos Carregados
O bot deve carregar todos os comandos das categorias:
- Admin (12)
- Economy (14)
- Gambling (5)
- Mining (1)
- Bounty (4)
- Utility (3)
- Guild (1)
- Profile (2)
- AI (2)

## 🔧 Solução de Problemas

### ❌ Erro: "Invalid token"

**Solução:** Verifique o `DISCORD_TOKEN` nas variáveis de ambiente.

### ❌ Erro: "Application did not respond"

**Causa:** Comandos não foram registrados.

**Solução:** Execute `npm run deploy` localmente ou `npm run deploy:prod` no ShardCloud.

### ❌ Erro: "Out of memory"

**Soluções:**
1. Use `npm run start:low-memory`
2. Aumente a memória no plano do ShardCloud
3. Configure `LOW_MEMORY=true`

### ❌ Erro: "Database connection failed"

**Solução:**
1. Verifique se `DATABASE_URL` está correto
2. Teste a conexão com o banco separadamente
3. Confirme que o banco PostgreSQL está acessível publicamente

### ❌ Bot online mas comandos não aparecem

**Causas possíveis:**
1. Comandos não foram registrados
2. Bot não tem permissões no servidor
3. Comandos foram registrados para servidor específico (guild) em vez de globalmente

**Solução:**
```bash
# Registrar comandos globalmente
npm run deploy
```

Aguarde até 1 hora para comandos globais aparecerem.

## 🔗 Integração com o Site

Após o bot estar funcionando:

1. Anote a URL do ShardCloud: `https://seu-bot.shardcloud.app`
2. Configure esta URL no site (VetraCloud):
   ```env
   BOT_API_URL=https://seu-bot.shardcloud.app
   ```
3. O site consumirá as APIs do bot automaticamente

## ⚙️ Configurações Recomendadas

### Memória
- **Mínimo:** 512MB
- **Recomendado:** 1GB
- **Ideal:** 2GB (para bots em 10+ servidores)

### CPU
- **Mínimo:** 1 vCPU
- **Recomendado:** 2 vCPUs

### Disco
- **Mínimo:** 500MB
- **Recomendado:** 1GB

## 🔄 Atualizar o Bot

1. Faça alterações no código
2. Execute `npm run build` localmente (testar)
3. Faça push para GitHub ou upload no ShardCloud
4. O bot reiniciará automaticamente

**Se alterou comandos:**
```bash
npm run deploy:prod
```

## 📝 Checklist de Deploy

- [ ] Bot criado no Discord Developer Portal
- [ ] Token (`DISCORD_TOKEN`) copiado
- [ ] Client ID (`DISCORD_CLIENT_ID`) copiado
- [ ] Banco de dados PostgreSQL criado
- [ ] `DATABASE_URL` copiada
- [ ] Variáveis de ambiente configuradas no ShardCloud
- [ ] Pasta `web-server/` removida do upload
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm run start:shard`
- [ ] Deploy realizado
- [ ] Comandos registrados no Discord
- [ ] Bot aparece online
- [ ] Comando `/ping` funciona
- [ ] APIs `/api/events` e `/api/emojis` acessíveis

## 🎉 Pronto!

Seu bot Discord agora está rodando no ShardCloud! 🤖

Ele está separado do site e expõe APIs para o site consumir dados.

## 🆘 Suporte

Se tiver problemas:
1. Verifique os logs no painel do ShardCloud
2. Consulte: `README.md` e `VERTRACLOUD_DEPLOY.md`
3. Teste comandos básicos como `/ping`
4. Verifique se o banco de dados está acessível

---

**Sheriff Rex Bot** 🤠
