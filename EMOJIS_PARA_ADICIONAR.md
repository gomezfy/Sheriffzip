# 📋 Lista de Emojis para Adicionar no Discord Developer Portal

Esta lista contém todos os emojis que precisam ser adicionados como **Application Emojis** no Discord Developer Portal para que o bot funcione com emojis customizados em todos os servidores.

## 🔗 Onde Adicionar

1. Acesse: https://discord.com/developers/applications
2. Selecione sua aplicação (Sheriff Rex Bot)
3. Vá em **Emojis** no menu lateral
4. Faça upload dos arquivos PNG/GIF

---

## ✅ Emojis JÁ CONFIGURADOS (não precisa adicionar)

Estes já estão em `src/utils/customEmojis.ts` com IDs válidos:

- `BEAR_PELT` - 🐻 Pele de urso
- `RABBIT_PELT` - 🐰 Pele de coelho
- `BISON_PELT` - 🦬 Pele de bisão
- `WOLF_PELT` - 🐺 Pele de lobo
- `DEER_PELT` - 🦌 Pele de cervo
- `REVOLVER_38` - 🔫 Revólver .38
- `RIFLE_DE_CACA` - 🔫 Rifle de caça
- `REVOLVER_VAQUEIRO` - 🔫 Revólver vaqueiro
- `ESCOPETA` - 🔫 Escopeta
- `LOCK` - 🔒 Cadeado
- `WARNING` - ⚠️ Aviso
- `SPARKLES` - ✨ Brilhos
- `DUST` - 💨 Poeira
- `COWBOYS` - 👥 Cowboys
- `TIMER` - ⏱️ Timer
- `CRATE` - 📦 Caixa
- `GEM` - 💎 Gema
- `CANCEL` - ❌ Cancelar
- `LIGHTNING` - ⚡ Raio
- `DIAMOND` - 💎 Diamante
- `BRONZE_MEDAL` - 🥉 Medalha de bronze
- `BANK` - 🏦 Banco
- `TROPHY` - 🏆 Troféu
- `INFO` - ℹ️ Info
- `GOLD_MEDAL` - 🥇 Medalha de ouro
- `STATS` - 📊 Estatísticas
- `COWBOY` - 🤠 Cowboy
- `BACKPACK` - 🎒 Mochila
- `DART` - 🎯 Alvo
- `COWBOY_HORSE` - 🏇 Cowboy a cavalo
- `SILVER_COIN` - 🪙 Moeda de prata
- `CHECK` - ✅ Check
- `MUTE` - 🔇 Mudo
- `RUNNING_COWBOY` - 🏃 Cowboy correndo
- `BRIEFCASE` - 💼 Maleta
- `MONEYBAG` - 💰 Saco de dinheiro
- `SALOON_TOKEN` - 🎫 Token do saloon
- `GIFT` - 🎁 Presente
- `CLOCK` - 🕐 Relógio
- `SCROLL` - 📜 Pergaminho
- `GOLD_BAR` - 🥇 Barra de ouro
- `BALANCE` - ⚖️ Balança
- `REVOLVER` - 🔫 Revólver
- `SILVER_MEDAL` - 🥈 Medalha de prata
- `PICKAXE` - ⛏️ Picareta
- `ALARM` - 🚨 Alarme
- `CURRENCY` - 💱 Câmbio - ✅ Já configurado (<:currency:1440185919356407848>)

---

## ❌ Emojis FALTANDO - 9 emojis (precisam ser adicionados)

Estes emojis são usados diretamente no código mas NÃO têm versão customizada configurada. Você precisa:

1. Criar/encontrar o arquivo PNG/GIF do emoji
2. Fazer upload no Discord Developer Portal
3. Copiar o ID do emoji
4. Adicionar em `src/utils/customEmojis.ts`

### 🎨 Interface e Moderação
- `SHERIFF_BADGE` - 👮 Badge de xerife (usado em comandos de moderação)
- `DESERT` - 🏜️ Deserto (usado em status)
- `BEER` - 🍺 Cerveja (usado em mensagens do saloon)
- `CARDS` - 🃏 Cartas (usado em jogos)
- `SWORDS` - ⚔️ Espadas (usado em duelos)
- `WRENCH` - 🔧 Chave inglesa (usado em configurações)
- `LINK` - 🔗 Link/corrente (usado em linked roles)
- `PIN` - 📍 Pin de localização (usado em territórios)
- `SETTINGS` - ⚙️ Configurações (usado em admin)

### 📦 Arquivos Necessários

Você precisa criar/obter estes arquivos de imagem (PNG ou GIF, max 256KB cada):

```
assets/custom-emojis/interface/
├── sheriff_badge.png
├── desert.png
├── beer.png
├── cards.png
├── swords.png
├── wrench.png
├── link.png
├── pin.png
└── settings.png
```

---

## 🔧 Como Atualizar Após Upload

Depois de fazer upload no Discord Developer Portal:

1. Copie o ID do emoji (clique com botão direito > Copiar ID)
2. Abra `src/utils/customEmojis.ts`
3. Adicione na seção `APPLICATION_EMOJIS`:

```typescript
export const APPLICATION_EMOJIS: { [key: string]: string } = {
  // ... emojis existentes ...
  
  // Novos emojis adicionados
  SHERIFF_BADGE: "<:sheriff_badge:SEU_ID_AQUI>",
  DESERT: "<:desert:SEU_ID_AQUI>",
  BEER: "<:beer:SEU_ID_AQUI>",
  CARDS: "<:cards:SEU_ID_AQUI>",
  SWORDS: "<:swords:SEU_ID_AQUI>",
  WRENCH: "<:wrench:SEU_ID_AQUI>",
  LINK: "<:link:SEU_ID_AQUI>",
  PIN: "<:pin:SEU_ID_AQUI>",
  SETTINGS: "<:settings:SEU_ID_AQUI>",
};
```

4. Adicione os fallbacks de texto (caso não consiga carregar):

```typescript
export const EMOJI_TEXT = {
  // ... emojis existentes ...
  
  // Novos fallbacks
  SHERIFF_BADGE: "👮",
  DESERT: "🏜️",
  BEER: "🍺",
  CARDS: "🃏",
  SWORDS: "⚔️",
  WRENCH: "🔧",
  LINK: "🔗",
  PIN: "📍",
  SETTINGS: "⚙️",
};
```

5. Crie as funções auxiliares (se necessário):

```typescript
export function getSheriffBadgeEmoji(): string {
  return getEmoji("sheriff_badge");
}
export function getDesertEmoji(): string {
  return getEmoji("desert");
}
export function getBeerEmoji(): string {
  return getEmoji("beer");
}
export function getCardsEmoji(): string {
  return getEmoji("cards");
}
export function getSwordsEmoji(): string {
  return getEmoji("swords");
}
export function getWrenchEmoji(): string {
  return getEmoji("wrench");
}
export function getLinkEmoji(): string {
  return getEmoji("link");
}
export function getPinEmoji(): string {
  return getEmoji("pin");
}
export function getSettingsEmoji(): string {
  return getEmoji("settings");
}
```

---

## 📊 Estatísticas de Uso

Emojis mais usados no código (número de ocorrências):

1. ❌ (411 vezes) - **CANCEL** - ✅ Já configurado
2. ✅ (196 vezes) - **CHECK** - ✅ Já configurado
3. 💰 (135 vezes) - **MONEYBAG** - ✅ Já configurado
4. 🤠 (120 vezes) - **COWBOY** - ✅ Já configurado
5. ⚠️ (83 vezes) - **WARNING** - ✅ Já configurado
6. 📊 (66 vezes) - **STATS** - ✅ Já configurado
7. 🎯 (62 vezes) - **DART** - ✅ Já configurado
8. 🔫 (50 vezes) - **REVOLVER/ARMAS** - ✅ Já configurado
9. 👮 (9 vezes) - **SHERIFF_BADGE** - ❌ Falta adicionar
10. 🏜️ (28 vezes) - **DESERT** - ❌ Falta adicionar

---

## ✅ Próximos Passos

1. ✅ Criar os arquivos PNG/GIF dos emojis faltantes
2. ⏳ Fazer upload no Discord Developer Portal
3. ⏳ Copiar os IDs e atualizar `customEmojis.ts`
4. ⏳ Testar os emojis em comandos
5. ⏳ Substituir uso direto de emojis Unicode por funções `getEmoji()`

---

## 📝 Notas Importantes

- Application Emojis funcionam em TODOS os servidores sem precisar upload manual
- Tamanho máximo por emoji: 256KB
- Formatos aceitos: PNG, GIF (animado ou estático)
- Máximo de 2000 Application Emojis por aplicação
- Os emojis customizados têm prioridade sobre os Unicode (fallback)
