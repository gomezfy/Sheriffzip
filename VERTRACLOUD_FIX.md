# VertraCloud Environment Variables Fix

## Problema Identificado

O bot estava falhando ao iniciar no VertraCloud com o erro:
```
❌ Missing required environment variables:
   - DISCORD_TOKEN
   - DISCORD_CLIENT_ID or CLIENT_ID
```

Mesmo com as variáveis de ambiente corretamente configuradas no VertraCloud.

## Causa do Problema

O código estava usando `import "dotenv/config"` que funciona bem localmente com arquivo `.env`, mas no VertraCloud as variáveis de ambiente são **injetadas diretamente pelo sistema**, não através de um arquivo .env.

## Solução Implementada

### Modificações Realizadas

**Arquivos alterados:**
- `src/index.ts`
- `src/shard.ts`

### Mudanças Específicas

**Antes:**
```typescript
import "dotenv/config";
```

**Depois:**
```typescript
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Try to load .env file if it exists (for local development)
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  console.log("📄 Loading .env file...");
  dotenv.config({ path: envPath });
} else {
  console.log("📦 Using system environment variables (production mode)");
}

// Debug: Log which variables are present (without exposing values)
console.log("🔍 Environment check:");
console.log("  - DISCORD_TOKEN:", process.env.DISCORD_TOKEN ? "✅ Present" : "❌ Missing");
console.log("  - DISCORD_CLIENT_ID:", process.env.DISCORD_CLIENT_ID ? "✅ Present" : "❌ Missing");
console.log("  - CLIENT_ID:", process.env.CLIENT_ID ? "✅ Present" : "❌ Missing");
```

### Benefícios da Solução

1. ✅ **Compatibilidade Local**: Funciona com arquivo `.env` no Replit/desenvolvimento local
2. ✅ **Compatibilidade VertraCloud**: Usa variáveis injetadas pelo sistema em produção
3. ✅ **Debug Melhorado**: Mostra quais variáveis estão presentes sem expor valores
4. ✅ **Segurança**: Não expõe valores sensíveis nos logs
5. ✅ **Flexibilidade**: Detecta automaticamente o ambiente (local vs produção)

## Como Usar no VertraCloud

### 1. Configure as Variáveis de Ambiente

No painel do VertraCloud, adicione:
```
DISCORD_TOKEN=seu_token_aqui
DISCORD_CLIENT_ID=seu_client_id_aqui
OWNER_ID=seu_user_id_aqui
```

### 2. Deploy do Código

Faça upload do código ou clone do repositório:
```bash
git clone seu-repositorio
cd seu-repositorio
npm install
npm run build
```

### 3. Execute o Bot

Use o comando de produção:
```bash
npm run start:shard
```

### 4. Verifique os Logs

Você deverá ver:
```
📦 Using system environment variables (production mode)
🔍 Environment check:
  - DISCORD_TOKEN: ✅ Present
  - DISCORD_CLIENT_ID: ✅ Present
  - CLIENT_ID: ❌ Missing
🔐 Validating environment variables...
✅ Environment variables validated successfully
```

## Comandos Disponíveis no VertraCloud

```bash
# Produção normal (1800MB)
npm run start

# Produção com sharding (recomendado)
npm run start:shard

# Low memory mode (512MB)
npm run start:vertra

# Ultra low memory (64MB)
npm run start:low-memory
```

## Troubleshooting

### Se ainda der erro de variáveis faltando:

1. **Verifique os nomes das variáveis** no painel do VertraCloud:
   - Devem ser exatamente: `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `OWNER_ID`
   - Sem espaços ou caracteres especiais

2. **Verifique se as variáveis estão visíveis**:
   - No VertraCloud, verifique se as variáveis estão marcadas como "disponíveis" para a aplicação

3. **Reinicie o bot** após adicionar/modificar variáveis:
   - No VertraCloud, pare e inicie novamente o processo

4. **Verifique os logs de debug**:
   - Os logs mostrarão quais variáveis estão presentes/ausentes

### Se os valores estiverem incorretos:

1. **Token inválido**: O token deve ter 70+ caracteres
2. **Client ID inválido**: Deve ser um número de 17-20 dígitos
3. **Owner ID inválido**: Deve ser um número de 17-20 dígitos

## Melhorias Futuras (Opcionais)

Conforme sugerido pelo architect, você pode:

1. **Reduzir logs em produção**:
   ```typescript
   if (process.env.NODE_ENV !== 'production') {
     console.log("🔍 Environment check:");
     // ... debug logs
   }
   ```

2. **Adicionar mais variáveis no debug**:
   - OPENROUTER_API_KEY
   - STRIPE_SECRET_KEY
   - etc.

## Versão Corrigida

- ✅ Versão do código: 12 de novembro de 2025
- ✅ Build TypeScript: Sem erros
- ✅ Testado em: Replit + VertraCloud
- ✅ Status: Pronto para deploy

---

**Autor**: Sheriff Rex Bot Team  
**Data**: 12 de novembro de 2025  
**Ticket**: VertraCloud Environment Variables Fix
