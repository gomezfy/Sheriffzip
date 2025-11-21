# Deploy para ShardCloud

## Preparação

### 1. Variáveis de Ambiente
Configure as seguintes variáveis no ShardCloud:

```env
# Discord
DISCORD_TOKEN=seu_token_aqui
DISCORD_CLIENT_ID=seu_client_id_aqui
CLIENT_ID=seu_client_id_aqui
DISCORD_CLIENT_SECRET=seu_client_secret_aqui

# Database (Neon PostgreSQL)
DATABASE_URL=sua_connection_string_aqui

# Opcionais
NODE_ENV=production
ENABLE_CACHE=true
```

### 2. Comandos de Build e Start

**Build Command:**
```bash
npm install && npm run build && npm run deploy:prod
```

**Start Command (recomendado):**
```bash
npm run start:shard
```

**Alternativas de Start:**
- `npm run start` - Versão sem sharding
- `npm run start:all` - Bot + Linked Roles server juntos
- `npm run start:low-memory` - Para ambientes com pouca memória

### 3. Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run build` | Compila TypeScript para JavaScript |
| `npm run start:shard` | Inicia bot com sharding (produção) |
| `npm run deploy:prod` | Faz deploy dos comandos para Discord |
| `npm run prod` | Build + Start com sharding |

### 4. Requisitos

- Node.js >= 18.0.0
- PostgreSQL (Neon recomendado)
- Memória: Mínimo 512MB, recomendado 1GB+

### 5. Após Deploy

1. Verifique se os comandos foram registrados no Discord
2. Teste o comando `/help` para confirmar que o bot está funcionando
3. Monitore os logs para possíveis erros

## Troubleshooting

### Bot não inicia
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme que o DISCORD_TOKEN está correto
- Verifique os logs para erros de conexão

### Comandos não aparecem
- Execute `npm run deploy:prod` manualmente
- Aguarde até 1 hora para comandos globais aparecerem
- Use comandos de guilda para testes instantâneos

### Erro de memória
- Use `npm run start:low-memory` se tiver pouca RAM
- Aumente a memória alocada no ShardCloud
