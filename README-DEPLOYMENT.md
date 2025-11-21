# Deployment no Vertra Cloud

## ✅ Configuração Otimizada para VertraCloud

Este bot está **otimizado** para deployment no Vertra Cloud com uso reduzido de memória e carregamento rápido de comandos.

### 📋 Configuração de Deployment

**Tipo:** Reserved VM (para bots Discord que precisam estar sempre online)
- **Build:** `npm run build:fast` (compila TypeScript rapidamente)
- **Run:** `npm run start:vertra` (512MB RAM - otimizado para VertraCloud)
- **Run (Alternativa):** `npm run start:vertra:shard` (384MB RAM por shard - para múltiplos servidores)

### 🔐 Variáveis de Ambiente Necessárias

Antes de publicar, configure estas variáveis no painel do Replit:

**Obrigatórias:**
- `DISCORD_TOKEN` - Token do seu bot Discord
- `DISCORD_CLIENT_ID` - ID do cliente Discord
- `DATABASE_URL` - ✅ Já configurado automaticamente

**Opcionais:**
- `DISCORD_CLIENT_SECRET` - Para Linked Roles
- `STRIPE_SECRET_KEY` - Para pagamentos com Stripe
- `SESSION_SECRET` - ✅ Já configurado
- `OWNER_ID` - Seu ID de usuário Discord (para comandos admin)

### 🚀 Como Publicar

1. Clique em **Deploy** (ou **Publish**) no topo do Replit
2. Selecione **Reserved VM**
3. Clique em **Publish**
4. Aguarde o build e deployment completarem

### 📊 Banco de Dados PostgreSQL

✅ O banco de dados PostgreSQL está **completamente configurado**:
- 12 tabelas criadas (users, inventory, mining_sessions, bounties, etc.)
- Sistema de storage em `server/storage.ts`
- Migrações disponíveis via `npm run db:migrate`

### 🛠️ Scripts Disponíveis

**VertraCloud (Otimizado):**
- `npm run start:vertra` - Bot otimizado (512MB RAM) - **RECOMENDADO**
- `npm run start:vertra:shard` - Bot com sharding (384MB/shard)
- `npm run build:fast` - Compila TypeScript sem linting

**Desenvolvimento:**
- `npm run dev` - Inicia bot em modo desenvolvimento
- `npm run dev:shard` - Start bot with sharding

**Produção (Servidores com mais RAM):**
- `npm run start` - Inicia bot compilado (1.8GB RAM)
- `npm run start:shard` - Inicia bot com sharding (1.8GB RAM)
- `npm run build` - Compila TypeScript

**Banco de Dados:**
- `npm run db:push` - Atualiza schema do banco
- `npm run db:studio` - Interface visual do banco
- `npm run db:migrate` - Migra dados JSON para PostgreSQL

**Comandos:**
- `npm run deploy` - Registra comandos no Discord (desenvolvimento)
- `npm run deploy:prod` - Registra comandos (produção compilada)

### ⚡ Otimizações para VertraCloud

**1. Uso Reduzido de Memória:**
- Script `start:vertra` usa apenas **512MB** de RAM (vs 1.8GB padrão)
- Modo `LOW_MEMORY=true` ativa cache otimizado
- Garbage collection automática com `--expose-gc`

**2. Carregamento Rápido de Comandos:**
- Deploy de comandos otimizado com tratamento de erros
- Medição de tempo de carregamento
- Logs informativos sobre progresso

**3. Cache Inteligente:**
- Cache agressivo para economizar memória
- Sweepers automáticos para limpar dados não utilizados
- Detecção automática de ambiente com pouca memória

**4. Sharding Otimizado:**
- Script `start:vertra:shard` usa apenas **384MB por shard**
- Perfeito para distribuir carga em múltiplos servidores
- Auto-restart em caso de falhas

### 🔍 Monitoramento

Após o deployment:
- Veja logs em tempo real no painel do Replit
- Use `npm run health` para verificar status
- Dados persistem automaticamente no PostgreSQL

---

**Nota:** Se encontrar erros de "missing environment variables" após deploy, adicione as variáveis obrigatórias no painel Secrets do Replit.
