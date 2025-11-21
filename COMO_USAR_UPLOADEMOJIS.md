# 🎨 Como Fazer Upload dos Emojis das Armas

## 📤 Comando para Upload

Use o comando no Discord:

```
/admin uploademojis action:Upload emojis to server
```

## ✨ O que acontece:

1. O bot vai procurar TODOS os arquivos PNG/GIF em `assets/custom-emojis/` **incluindo subpastas**
2. Isso inclui automaticamente as 4 armas em `assets/custom-emojis/weapons/`:
   - ✅ escopeta.png
   - ✅ revolver_vaqueiro.png
   - ✅ revolver_38.png
   - ✅ rifle_de_caca.png

3. O bot faz upload de cada emoji para o servidor Discord
4. Salva o mapeamento dos emojis em `data/emoji-mapping.json`

## 📋 Opções do Comando:

- **Upload emojis to server** - Faz upload de todos os emojis novos (recomendado)
- **Sync existing server emojis** - Sincroniza emojis já existentes no servidor
- **Remove all emojis from server** - Remove todos os custom emojis (cuidado!)

## ⚠️ Requisitos:

1. **Você precisa ser Administrador do servidor**
2. **O bot precisa ter permissão de "Gerenciar Emojis"**
3. **O servidor não pode estar no limite de emojis:**
   - Sem boost: 50 emojis estáticos
   - Level 1 (2 boosts): 100 emojis
   - Level 2 (7 boosts): 150 emojis
   - Level 3 (14 boosts): 250 emojis

## 🎯 Resultado Esperado:

Após executar o comando, você verá uma mensagem com:
```
🎨 Custom Emoji Upload Results

✅ Successfully Uploaded/Updated: 4 emoji(s)
❌ Failed: 0 emoji(s)

📋 Available Custom Emojis
escopeta, revolver_vaqueiro, revolver_38, rifle_de_caca
```

## ✅ Verificar se Funcionou:

1. Use `/inventario` no Discord
2. Se você tiver alguma arma no inventário, ela aparecerá com seu emoji customizado
3. Cada arma terá sua imagem real em vez do 🔫 genérico

## 🔧 Modificação Feita no Código:

Atualizei `src/utils/emojiUploader.ts` para:
- ✅ Ler arquivos recursivamente em subpastas
- ✅ Incluir automaticamente a pasta `weapons/`
- ✅ Manter compatibilidade com emojis antigos

Agora é só usar o comando e pronto! 🤠🔫
