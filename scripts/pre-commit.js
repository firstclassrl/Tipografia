#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  console.log('🔄 Incremento versione...');
  
  // Esegui lo script di incremento versione
  execSync('node scripts/increment-version.js', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log('✅ Versione incrementata con successo');
  
} catch (error) {
  console.error('❌ Errore nell\'incremento della versione:', error);
  process.exit(1);
}
