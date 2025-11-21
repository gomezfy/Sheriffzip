# 🚀 Guia de Deploy para VertraCloud

## ✅ Pré-requisitos

1. Conta criada no [VertraCloud](https://vertracloud.app)
2. Token do bot Discord configurado
3. Application ID (CLIENT_ID) do Discord
4. Código do bot compilado

## 📋 Passo a Passo para Deploy

### 1️⃣ Preparar o Projeto Localmente

Certifique-se que tudo está funcionando:

```bash
# Instalar dependências
npm install

# Compilar TypeScript
npm run build

# Testar localmente (opcional)
npm run start:vertra
```

### 2️⃣ Configurar Variáveis de Ambiente no VertraCloud

No painel do VertraCloud, configure as seguintes variáveis:

#### **Obrigatórias:**
```env
DISCORD_TOKEN=seu_token_aqui
DISCORD_CLIENT_ID=seu_client_id_aqui
OWNER_ID=seu_user_id_aqui
NODE_ENV=production
LOW_MEMORY=true
```

#### **Opcionais (se você usa):**
```env
OPENROUTER_API_KEY=sua_chave_openrouter
STRIPE_SECRET_KEY=sua_chave_stripe
HOTMART_CLIENT_ID=seu_client_id_hotmart
SESSION_SECRET=secret_aleatorio_aqui
```

### 3️⃣ Upload do Código

**Opção A: Via GitHub**
1. Faça push do código para seu repositório GitHub
2. No VertraCloud, conecte seu repositório
3. O VertraCloud fará o build automaticamente

**Opção B: Via Upload Direto**
1. Crie um arquivo ZIP com o projeto
2. Faça upload no painel do VertraCloud
3. Aguarde o build

### 4️⃣ Configurar Comandos de Build e Start

No painel do VertraCloud, configure:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm run start:vertra
```

### 5️⃣ Registrar Comandos do Discord

Após o primeiro deploy, você precisa registrar os comandos slash:

**Opção A: Via VertraCloud Console**
```bash
npm run deploy:prod
```

**Opção B: Localmente (recomendado)**
```bash
# Configure .env local com suas credenciais
DISCORD_TOKEN=seu_token DISCORD_CLIENT_ID=seu_client_id npm run deploy
```

## 🎯 Scripts Disponíveis para VertraCloud

| Script | Comando | Uso |
|--------|---------|-----|
| **Build** | `npm run build` | Compilar TypeScript |
| **Deploy Comandos** | `npm run deploy:prod` | Registrar comandos no Discord |
| **Start (VertraCloud)** | `npm run start:vertra` | Iniciar bot em modo low memory (512MB) |
| **Start (Ultra Low)** | `npm run start:low-memory` | Iniciar bot em modo ultra low memory (64MB) |

## ⚙️ Configurações Recomendadas

### Memória
- **Mínimo:** 512MB (usa `start:vertra`)
- **Recomendado:** 1GB
- **Máximo:** 2GB (usa `start`)

### Disco
- **Mínimo:** 500MB
- **Recomendado:** 1GB

### CPU
- **Mínimo:** 1 vCPU
- **Recomendado:** 2 vCPUs

## 🔧 Solução de Problemas

### ❌ Erro: "Commands not found"
**Solução:** Execute `npm run deploy:prod` após o primeiro deploy

### ❌ Erro: "Out of memory"
**Solução:** Use `npm run start:low-memory` ou aumente a memória no VertraCloud

### ❌ Erro: "Module not found"
**Solução:** Certifique-se que o build foi executado com sucesso:
```bash
npm run build
```

### ❌ Erro: "Token invalid"
**Solução:** Verifique se `DISCORD_TOKEN` está configurado corretamente nas variáveis de ambiente

## 📊 Monitoramento

### Verificar Status do Bot
```bash
# Via logs do VertraCloud
tail -f logs/output.log
```

### Verificar Comandos Carregados
Procure por esta linha nos logs:
```
✅ Loaded 46 commands
```

### Verificar Bot Online
Procure por:
```
✅ Bot online as Sheriff Rex#5281
```

## 🔄 Atualizar o Bot

1. Faça suas alterações no código
2. Compile localmente: `npm run build`
3. Faça push para GitHub ou upload no VertraCloud
4. O bot reiniciará automaticamente

Se mudou estrutura de comandos:
```bash
npm run deploy:prod
```

## 📝 Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Código compilado sem erros (`npm run build`)
- [ ] Build command configurado: `npm install && npm run build`
- [ ] Start command configurado: `npm run start:vertra`
- [ ] Upload do código feito
- [ ] Comandos registrados no Discord (`npm run deploy:prod`)
- [ ] Bot aparecendo online no Discord
- [ ] Teste de comandos funcionando

## 🎉 Pronto!

Seu bot Discord agora está rodando no VertraCloud! 🤠

### Comandos Disponíveis
O bot possui **46 comandos** organizados em 9 categorias:
- 🤖 AI (2)
- ⚙️ Admin/Moderação (12)
- 🔫 Bounty (4)
- 💰 Economia (14)
- 🎰 Jogos (5)
- ⛏️ Mineração (1)
- 🏰 Guilda (1)
- 👤 Perfil (2)
- 🔧 Utilidades (3)

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs do VertraCloud
2. Consulte a documentação: [README.md](./README.md)
3. Abra uma issue no GitHub

---

**Sheriff Bot** - Bringing Wild West to Discord 🤠
