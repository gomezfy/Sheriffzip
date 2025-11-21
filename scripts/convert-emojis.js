const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const emojisToConvert = [
  {
    source: 'attached_assets/stock_images/sheriff_badge_star_w_78648864.jpg',
    dest: 'assets/custom-emojis/interface/sheriff_badge.png'
  },
  {
    source: 'attached_assets/stock_images/desert_cactus_wester_95a04884.jpg',
    dest: 'assets/custom-emojis/interface/desert.png'
  },
  {
    source: 'attached_assets/stock_images/beer_mug_glass_weste_0d7937a8.jpg',
    dest: 'assets/custom-emojis/interface/beer.png'
  },
  {
    source: 'attached_assets/stock_images/playing_cards_poker__646058c3.jpg',
    dest: 'assets/custom-emojis/interface/cards.png'
  },
  {
    source: 'attached_assets/stock_images/crossed_swords_weste_4978133d.jpg',
    dest: 'assets/custom-emojis/interface/swords.png'
  },
  {
    source: 'attached_assets/stock_images/wrench_tool_repair_i_4936e2ab.jpg',
    dest: 'assets/custom-emojis/interface/wrench.png'
  },
  {
    source: 'attached_assets/stock_images/chain_link_connectio_3f8e415e.jpg',
    dest: 'assets/custom-emojis/interface/link.png'
  },
  {
    source: 'attached_assets/stock_images/location_pin_map_mar_8476a4b4.jpg',
    dest: 'assets/custom-emojis/interface/pin.png'
  },
  {
    source: 'attached_assets/stock_images/settings_gear_config_3a188403.jpg',
    dest: 'assets/custom-emojis/interface/settings.png'
  }
];

async function convertEmojis() {
  console.log('🎨 Convertendo emojis para PNG 128x128...\n');
  
  for (const emoji of emojisToConvert) {
    try {
      await sharp(emoji.source)
        .resize(128, 128, {
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toFile(emoji.dest);
      
      const stats = fs.statSync(emoji.dest);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`✅ ${path.basename(emoji.dest)} - ${sizeKB}KB`);
    } catch (error) {
      console.error(`❌ Erro ao converter ${emoji.dest}:`, error.message);
    }
  }
  
  console.log('\n✨ Conversão concluída!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Faça upload destes arquivos no Discord Developer Portal');
  console.log('2. Copie os IDs dos emojis');
  console.log('3. Atualize src/utils/customEmojis.ts com os IDs');
}

convertEmojis().catch(console.error);
