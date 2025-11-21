# 🎨 Como Configurar Application Emojis (Emojis do Aplicativo)

## ✅ Preparação Concluída
As imagens das peles já foram redimensionadas para **128x128 pixels** e estão prontas para upload!

Localização: `assets/custom-emojis/pelts/`
- ✅ `rabbit_pelt.png` - 7KB
- ✅ `deer_pelt.png` - 4KB  
- ✅ `wolf_pelt.png` - 5KB
- ✅ `bison_pelt.png` - 4KB
- ✅ `bear_pelt.png` - 4KB

---

## 📋 Passo 1: Upload no Discord Developer Portal

1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications)
2. Selecione seu aplicativo **Sheriff Rex Bot**
3. No menu lateral, clique em **"Emojis"**
4. Clique em **"Upload Emoji"**
5. Faça upload de cada arquivo de `assets/custom-emojis/pelts/`:

   | Arquivo | Nome Sugerido |
   |---------|---------------|
   | `rabbit_pelt.png` | `rabbit_pelt` |
   | `deer_pelt.png` | `deer_pelt` |
   | `wolf_pelt.png` | `wolf_pelt` |
   | `bison_pelt.png` | `bison_pelt` |
   | `bear_pelt.png` | `bear_pelt` |

⚠️ **IMPORTANTE**: Use exatamente esses nomes para facilitar a configuração!

---

## 🔍 Passo 2: Obter os IDs dos Emojis

Após fazer o upload, você verá cada emoji listado no Developer Portal. Para obter o ID de cada um:

### Opção A: Via Developer Portal (mais fácil)
1. No Developer Portal, na página de Emojis
2. Passe o mouse sobre cada emoji
3. Clique com botão direito e selecione "Copiar Link do Emoji"
4. O link terá este formato: `https://cdn.discordapp.com/emojis/1234567890123456789.png`
5. O número `1234567890123456789` é o **ID do emoji**

### Opção B: Via Discord (método alternativo)
1. No Discord, digite `\:rabbit_pelt:` (com a barra invertida)
2. Envie a mensagem
3. Você verá algo como: `<:rabbit_pelt:1234567890123456789>`
4. Copie o conteúdo completo entre `< >`

---

## ⚙️ Passo 3: Configurar os IDs no Código

Abra o arquivo `src/utils/customEmojis.ts` e procure a seção `APPLICATION_EMOJIS`:

```typescript
export const APPLICATION_EMOJIS: { [key: string]: string } = {
  // Peles de Animais - CONFIGURE OS IDs AQUI APÓS FAZER UPLOAD
  RABBIT_PELT: "", // Ex: "<:rabbit_pelt:1234567890123456789>"
  DEER_PELT: "",   // Ex: "<:deer_pelt:1234567890123456789>"
  WOLF_PELT: "",   // Ex: "<:wolf_pelt:1234567890123456789>"
  BISON_PELT: "",  // Ex: "<:bison_pelt:1234567890123456789>"
  BEAR_PELT: "",   // Ex: "<:bear_pelt:1234567890123456789>"
};
```

Substitua os valores vazios pelos IDs que você copiou:

```typescript
export const APPLICATION_EMOJIS: { [key: string]: string } = {
  RABBIT_PELT: "<:rabbit_pelt:1234567890123456789>",
  DEER_PELT: "<:deer_pelt:9876543210987654321>",
  WOLF_PELT: "<:wolf_pelt:1111111111111111111>",
  BISON_PELT: "<:bison_pelt:2222222222222222222>",
  BEAR_PELT: "<:bear_pelt:3333333333333333333>",
};
```

⚠️ **Formato correto**: `<:nome_emoji:ID_numerico>`

---

## 🚀 Passo 4: Reiniciar o Bot

Após configurar os IDs, reinicie o bot para aplicar as mudanças:

```bash
npm run dev
```

---

## ✨ Como Funciona

O sistema agora usa **prioridade de 3 níveis**:

1. **Application Emojis** (prioridade máxima)
   - Configurados em `APPLICATION_EMOJIS`
   - Funcionam em TODOS os servidores onde o bot está instalado
   - Não precisam de upload por servidor

2. **Server Emojis** (segunda prioridade)
   - Upload automático por servidor via `/admin emojis upload`
   - Funcionam apenas no servidor onde foram enviados

3. **Emojis de Texto** (fallback)
   - Emojis Unicode padrão (🐰 🦌 🐺 🦬 🐻)
   - Usados se nenhum dos anteriores estiver disponível

---

## 🎯 Benefícios dos Application Emojis

✅ **Universais**: Funcionam em qualquer servidor onde o bot está instalado  
✅ **Sem limite de servidor**: Não ocupam slots de emoji do servidor  
✅ **Tamanho otimizado**: 128x128 pixels, carregam rápido  
✅ **Qualidade consistente**: Mesmo visual em todos os lugares  
✅ **Fácil manutenção**: Atualiza em um lugar, aplica em todos os servidores  

---

## 🔧 Troubleshooting

**Problema**: Os emojis não aparecem  
**Solução**: Verifique se:
- Os IDs estão no formato correto `<:nome:ID>`
- Você reiniciou o bot após configurar
- O bot tem permissão de "Use External Emojis"

**Problema**: Aparece o emoji de texto ao invés da imagem  
**Solução**: 
- Confirme que os IDs foram configurados corretamente
- Verifique se não há espaços extras nos IDs
- Teste enviando o emoji manualmente no Discord para validar o formato

---

**📝 Nota**: Após configurar, os emojis das peles aparecerão automaticamente no inventário (`/inventory`) e no resultado da caçada (`/hunt`)!
