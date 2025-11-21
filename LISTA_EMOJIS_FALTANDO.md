# 🎯 Lista Rápida: Emojis Faltando

## ✅ Peles - TODAS CONFIGURADAS (5/5)
Todas as peles já estão no Discord Developer Portal e funcionando:
- ✅ BEAR_PELT (Urso)
- ✅ RABBIT_PELT (Coelho)
- ✅ BISON_PELT (Bisão)
- ✅ WOLF_PELT (Lobo)
- ✅ DEER_PELT (Cervo)

## ❌ Emojis de Interface - FALTAM 9

### Arquivos PNG Prontos para Upload
Todos estão em `assets/custom-emojis/interface/`:

1. **sheriff_badge.png** (47KB) - 👮 Badge de xerife
2. **desert.png** (40KB) - 🏜️ Deserto
3. **beer.png** (30KB) - 🍺 Cerveja
4. **cards.png** (46KB) - 🃏 Cartas
5. **swords.png** (46KB) - ⚔️ Espadas
6. **wrench.png** (18KB) - 🔧 Chave inglesa
7. **link.png** (45KB) - 🔗 Link
8. **pin.png** (35KB) - 📍 Pin de localização
9. **settings.png** (43KB) - ⚙️ Configurações

## 🚀 Ação Necessária

### 1. Upload no Discord
- Vá em: https://discord.com/developers/applications
- Selecione **Sheriff Rex Bot** > **Emojis**
- Faça upload dos 9 arquivos PNG

### 2. Copiar IDs
- Clique com botão direito em cada emoji
- "Copiar Link do Emoji"
- Anote os IDs numéricos

### 3. Atualizar Código
Edite `src/utils/customEmojis.ts` (linhas 65-73):
```typescript
SHERIFF_BADGE: "<:sheriff_badge:SEU_ID>",
DESERT: "<:desert:SEU_ID>",
BEER: "<:beer:SEU_ID>",
CARDS: "<:cards:SEU_ID>",
SWORDS: "<:swords:SEU_ID>",
WRENCH: "<:wrench:SEU_ID>",
LINK: "<:link:SEU_ID>",
PIN: "<:pin:SEU_ID>",
SETTINGS: "<:settings:SEU_ID>",
```

## 📊 Estatísticas
- **Total de emojis**: 55
- **Configurados**: 46 (84%)
- **Faltando**: 9 (16%)
- **Prioridade**: ALTA (usados em 37+ lugares no código)

## ✨ Benefícios
- Interface 100% personalizada estilo western
- Emojis funcionam em TODOS os servidores
- Performance melhorada
- Visual profissional e único
