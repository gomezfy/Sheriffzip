# 🚀 Sistema de Deploy Automático - ShardCloud

## Como Funciona

Quando você fizer deploy no ShardCloud usando o botão "Deploy" no Replit, o sistema executará automaticamente:

### 1. **Build Phase (Compilação)**
```bash
npm install && npm run build && npm run deploy:prod
```

**O que acontece:**
- ✅ Instala todas as dependências necessárias
- ✅ Compila o código TypeScript para JavaScript
- ✅ **Atualiza automaticamente os comandos no Discord** via API

### 2. **Run Phase (Execução)**
```bash
npm run start:shard
```

**O que acontece:**
- ✅ Inicia o bot com sistema de sharding (para suportar muitos servidores)
- ✅ Carrega todos os comandos atualizados
- ✅ Conecta ao Discord e fica online

## 📋 Pré-requisitos

Para o deploy funcionar, você precisa configurar as seguintes **secrets** no Replit:

### Obrigatórias:
- `DISCORD_TOKEN` - Token do bot (Discord Developer Portal)
- `CLIENT_ID` ou `DISCORD_CLIENT_ID` - ID da aplicação Discord

### Opcionais (mas recomendadas):
- `OWNER_ID` - Seu Discord User ID (para comandos admin)
- `DATABASE_URL` - URL do banco PostgreSQL (Neon)
- `OPENROUTER_API_KEY` - Para comandos de IA

## 🔧 Como Configurar

1. **Adicione as secrets no Replit:**
   - Vá em "Tools" → "Secrets" no Replit
   - Adicione `DISCORD_TOKEN` e `CLIENT_ID`

2. **Faça o Deploy:**
   - Clique no botão "Deploy" 
   - Escolha o tipo de deploy (Autoscale ou VM)
   - O sistema fará tudo automaticamente!

## ✨ Vantagens

- **Comandos sempre atualizados** - Não precisa rodar scripts manualmente
- **Deploy em um clique** - Tudo é automático
- **Zero downtime** - O bot atualiza sem parar de funcionar
- **Confiável** - Build falha se algo estiver errado (evita bugs em produção)

## 📝 Logs

Durante o deploy, você verá:
```
🔄 Registering 50 slash commands...
✅ 50 commands registered successfully!
```

Isso confirma que os comandos foram atualizados no Discord!

## 🎯 Deployment Type

**Configurado como: VM (Virtual Machine)**

Isso significa:
- ✅ Bot sempre online
- ✅ Mantém estado em memória
- ✅ Ideal para bots com economia/inventário
- ✅ Suporta websockets e conexões persistentes

## 🔄 Atualizações Futuras

Quando você adicionar novos comandos:
1. Edite o código
2. Faça commit (opcional)
3. Clique em "Deploy"
4. Pronto! Os novos comandos já estarão disponíveis no Discord

---

**Configurado automaticamente pelo Replit Agent**
