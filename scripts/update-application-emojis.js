/**
 * Script para atualizar os IDs dos Application Emojis
 * 
 * Como usar:
 * 1. Faça upload das peles no Discord Developer Portal
 * 2. Copie os IDs dos emojis
 * 3. Execute: node scripts/update-application-emojis.js
 * 4. Cole os IDs quando solicitado
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const emojis = [
  { key: 'RABBIT_PELT', name: 'rabbit_pelt', desc: 'Pele de Coelho' },
  { key: 'DEER_PELT', name: 'deer_pelt', desc: 'Pele de Cervo' },
  { key: 'WOLF_PELT', name: 'wolf_pelt', desc: 'Pele de Lobo' },
  { key: 'BISON_PELT', name: 'bison_pelt', desc: 'Pele de Bisão' },
  { key: 'BEAR_PELT', name: 'bear_pelt', desc: 'Pele de Urso' },
];

const emojiIds = {};

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  🎨 CONFIGURADOR DE APPLICATION EMOJIS                       ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

console.log('📋 Instruções:');
console.log('1. Acesse: https://discord.com/developers/applications');
console.log('2. Selecione seu bot > Emojis');
console.log('3. Para cada emoji, copie o ID completo\n');
console.log('Formato aceito:');
console.log('  - Completo: <:rabbit_pelt:1234567890123456789>');
console.log('  - Apenas ID: 1234567890123456789');
console.log('  - Deixe vazio para pular\n');
console.log('════════════════════════════════════════════════════════════════\n');

let currentIndex = 0;

function askNextEmoji() {
  if (currentIndex >= emojis.length) {
    finishConfiguration();
    return;
  }

  const emoji = emojis[currentIndex];
  rl.question(`🎯 ${emoji.desc} (${emoji.name}): `, (answer) => {
    const trimmed = answer.trim();
    
    if (trimmed) {
      // Extrai o ID do formato completo ou aceita apenas o ID
      const match = trimmed.match(/<:[\w_]+:(\d+)>/) || trimmed.match(/^(\d+)$/);
      
      if (match) {
        const id = match[1];
        emojiIds[emoji.key] = `<:${emoji.name}:${id}>`;
        console.log(`   ✅ Configurado!\n`);
      } else {
        console.log(`   ⚠️  Formato inválido, pulando...\n`);
      }
    } else {
      console.log(`   ⏭️  Pulado\n`);
    }
    
    currentIndex++;
    askNextEmoji();
  });
}

function finishConfiguration() {
  rl.close();
  
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('📝 Resumo da Configuração:\n');
  
  const configured = Object.keys(emojiIds).length;
  console.log(`✅ Emojis configurados: ${configured}/${emojis.length}\n`);
  
  if (configured === 0) {
    console.log('❌ Nenhum emoji foi configurado. Abortando...\n');
    process.exit(0);
  }
  
  // Mostra os emojis configurados
  Object.entries(emojiIds).forEach(([key, value]) => {
    const emoji = emojis.find(e => e.key === key);
    console.log(`   ${emoji.desc}: ${value}`);
  });
  
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('💾 Atualizando arquivo customEmojis.ts...\n');
  
  try {
    const filePath = path.join(__dirname, '..', 'src', 'utils', 'customEmojis.ts');
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Atualiza cada emoji configurado
    Object.entries(emojiIds).forEach(([key, value]) => {
      const regex = new RegExp(`${key}:\\s*"[^"]*"`, 'g');
      content = content.replace(regex, `${key}: "${value}"`);
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log('✅ Arquivo atualizado com sucesso!\n');
    console.log('════════════════════════════════════════════════════════════════');
    console.log('🚀 Próximos passos:\n');
    console.log('1. Reinicie o bot: npm run dev');
    console.log('2. Os emojis já estarão funcionando em TODOS os servidores!\n');
    console.log('════════════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar arquivo:', error.message);
    process.exit(1);
  }
}

askNextEmoji();
