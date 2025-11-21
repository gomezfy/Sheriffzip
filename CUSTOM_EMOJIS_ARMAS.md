# 🔫 Custom Emojis das Armas - Guia de Upload

## ✅ O que foi feito:

1. **Imagens baixadas e redimensionadas (64x64 pixels):**
   - `assets/custom-emojis/weapons/escopeta.png`
   - `assets/custom-emojis/weapons/revolver_vaqueiro.png`
   - `assets/custom-emojis/weapons/revolver_38.png`
   - `assets/custom-emojis/weapons/rifle_de_caca.png`

2. **Configuração atualizada:**
   - ✅ `src/utils/customEmojis.ts` - Custom emojis adicionados
   - ✅ `src/utils/inventoryManager.ts` - Armas configuradas para usar custom emojis

## 📤 Como fazer upload dos emojis no Discord:

### Opção 1: Upload Manual (Mais Simples)

1. **Acesse as configurações do servidor Discord**
   - Clique com botão direito no nome do servidor
   - Selecione "Configurações do Servidor"
   - Vá em "Emoji" na barra lateral

2. **Faça upload de cada arma:**
   - Clique em "Carregar Emoji"
   - Selecione o arquivo de imagem
   - **IMPORTANTE:** Use exatamente estes nomes:
     - `escopeta` para escopeta.png
     - `revolver_vaqueiro` para revolver_vaqueiro.png
     - `revolver_38` para revolver_38.png
     - `rifle_de_caca` para rifle_de_caca.png

3. **Salvar e pronto!** 🎉

### Opção 2: Upload Automático via Bot

O bot tem um sistema de upload automático de emojis. Para usar:

```bash
# Executar o script de upload (se configurado)
npm run icons:upload
```

**Ou use o comando do bot:**
```
/upload-emojis
```

## 🎯 Como funciona:

- **Com custom emojis uploadados:** Cada arma mostrará sua imagem real redimensionada no tamanho de emoji
- **Sem custom emojis:** O bot usará o emoji fallback 🔫 padrão

## 🔍 Verificar se está funcionando:

1. Use o comando `/inventario` no Discord
2. Se você tiver alguma arma, ela deve aparecer com seu emoji customizado
3. Se não funcionar, verifique se:
   - Os emojis foram uploadados com os nomes exatos
   - O bot tem permissão para usar emojis externos
   - O servidor não atingiu o limite de emojis

## 📋 Limites do Discord:

- **Servidores sem Boost:** 50 emojis estáticos, 50 animados
- **Nível 1 (2 boosts):** 100 emojis estáticos, 100 animados
- **Nível 2 (7 boosts):** 150 emojis estáticos, 150 animados
- **Nível 3 (14 boosts):** 250 emojis estáticos, 250 animados

## 🎨 Arquivos das Armas:

As imagens estão salvas em:
```
assets/custom-emojis/weapons/
├── escopeta.png (5.0K)
├── revolver_vaqueiro.png (5.3K)
├── revolver_38.png (5.5K)
└── rifle_de_caca.png (4.3K)
```

Todos os arquivos são PNG de 64x64 pixels, perfeitos para emojis do Discord! 🤠
