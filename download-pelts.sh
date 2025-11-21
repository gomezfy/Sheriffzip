#!/bin/bash
# Script para baixar os emojis customizados das peles

echo "📥 Baixando emojis customizados das peles..."

cd assets/custom-emojis/pelts

# Pele de Coelho
echo "🐰 Baixando pele de coelho..."
curl -L "https://i.postimg.cc/s2XhZpxf/D235FB82-9508-4A97-AE1C-9E1E4C6CC5AA.png" -o rabbit_pelt.png

# Pele de Cervo
echo "🦌 Baixando pele de cervo..."
curl -L "https://i.postimg.cc/sgnByvcZ/E73819F8-3974-4895-9587-003D27307C3C.png" -o deer_pelt.png

# Pele de Lobo
echo "🐺 Baixando pele de lobo..."
curl -L "https://i.postimg.cc/rsCmHmsZ/F973B0C2-BE9C-4114-8A2E-C851F99A510A.png" -o wolf_pelt.png

# Pele de Bisão
echo "🦬 Baixando pele de bisão..."
curl -L "https://i.postimg.cc/MGMGStXj/E7B908CE-3E40-4D73-A89C-54712A1935DA.png" -o bison_pelt.png

# Pele de Urso
echo "🐻 Baixando pele de urso..."
curl -L "https://i.postimg.cc/52GxnvpN/90170D80-51C3-4CC0-8824-308AA796034A.png" -o bear_pelt.png

echo ""
echo "✅ Todas as peles foram baixadas!"
echo "📁 Localização: assets/custom-emojis/pelts/"
echo ""
echo "🎯 Próximo passo: Use o comando /admin no Discord e depois faça upload dos emojis!"
