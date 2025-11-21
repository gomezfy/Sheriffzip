const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const emojisToConvert = [
  {
    source: 'attached_assets/stock_images/wooden_crate_box_wes_dcc72df9.jpg',
    dest: 'assets/custom-emojis/interface/crate.png'
  },
  {
    source: 'attached_assets/stock_images/green_checkmark_succ_704c57fb.jpg',
    dest: 'assets/custom-emojis/interface/check.png'
  },
  {
    source: 'attached_assets/stock_images/red_cross_x_cancel_i_dbe331af.jpg',
    dest: 'assets/custom-emojis/interface/cross.png'
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
  console.log('📋 Emojis prontos para uso no canvas:');
  console.log('  - crate.png (📦)');
  console.log('  - check.png (✅)');
  console.log('  - cross.png (❌)');
}

convertEmojis().catch(console.error);
