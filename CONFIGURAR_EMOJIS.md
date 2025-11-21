# 🚀 Guia Rápido: Application Emojis

## ⚡ Configuração em 3 Passos

### 📤 PASSO 1: Upload das Imagens

1. Acesse: **https://discord.com/developers/applications**
2. Selecione seu bot (Sheriff Rex Bot)
3. Clique em **"Emojis"** no menu lateral
4. Clique em **"Upload Emoji"**
5. Envie os 5 arquivos de `assets/custom-emojis/pelts/`:
   - `rabbit_pelt.png` → Nome: **rabbit_pelt**
   - `deer_pelt.png` → Nome: **deer_pelt**
   - `wolf_pelt.png` → Nome: **wolf_pelt**
   - `bison_pelt.png` → Nome: **bison_pelt**
   - `bear_pelt.png` → Nome: **bear_pelt**

⚠️ **IMPORTANTE**: Use exatamente esses nomes!

---

### 🔧 PASSO 2: Configurar os IDs (AUTOMÁTICO)

Depois do upload, execute este comando no terminal:

```bash
node scripts/update-application-emojis.js
```

O script vai te guiar! Você só precisa:
1. Copiar o ID de cada emoji do Developer Portal
2. Colar quando solicitado

**Como copiar o ID:**
- No Developer Portal, clique com botão direito no emoji
- "Copiar Link do Emoji"
- O ID é o número na URL: `https://cdn.discordapp.com/emojis/1234567890123456789.png`
- Cole o número `1234567890123456789` OU cole o formato completo `<:rabbit_pelt:1234567890123456789>`

---

### 🚀 PASSO 3: Reiniciar o Bot

```bash
npm run dev
```

**PRONTO!** ✅ Os emojis agora funcionam em **TODOS** os servidores onde o bot está instalado!

---

## 📸 Como Obter os IDs (Método Visual)

1. No Developer Portal, página de Emojis
2. Passe o mouse sobre o emoji
3. Clique direito → "Copiar Link do Emoji"
4. Cole o link: `https://cdn.discordapp.com/emojis/1234567890123456789.png`
5. O número `1234567890123456789` é o ID!

---

## ✅ Vantagens

Depois de configurar:
- ✅ Funciona em **TODOS** os servidores (sem precisar configurar em cada um)
- ✅ Emojis pequenos e otimizados (128x128px)
- ✅ Carregam rápido
- ✅ Qualidade consistente
- ✅ Não ocupam slots de emoji dos servidores

---

## ❓ Dúvidas?

**P: E se eu não configurar?**  
R: O bot usa emojis de texto (🐰 🦌 🐺 🦬 🐻) como fallback. Funciona, mas não fica tão bonito!

**P: Preciso fazer em cada servidor?**  
R: NÃO! É isso que é ótimo dos Application Emojis - configura uma vez, funciona em todos!

**P: E se eu adicionar o bot em um servidor novo depois?**  
R: Já vai funcionar automaticamente! 🎉
