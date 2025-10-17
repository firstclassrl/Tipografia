#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Percorso del file di versione
const versionFile = path.join(__dirname, '../src/config/version.ts');

try {
  // Leggi il file di versione
  let content = fs.readFileSync(versionFile, 'utf8');
  
  // Estrai la versione corrente
  const versionMatch = content.match(/export const APP_VERSION = '(\d+\.\d+\.\d+)';/);
  
  if (!versionMatch) {
    console.error('Errore: Impossibile trovare la versione nel file');
    process.exit(1);
  }
  
  const currentVersion = versionMatch[1];
  const parts = currentVersion.split('.');
  const major = parseInt(parts[0]);
  const minor = parseInt(parts[1]);
  const patch = parseInt(parts[2]);
  
  // Incrementa la patch version
  const newVersion = `${major}.${minor}.${patch + 1}`;
  
  // Sostituisci la versione nel file
  const newContent = content.replace(
    /export const APP_VERSION = '\d+\.\d+\.\d+';/,
    `export const APP_VERSION = '${newVersion}';`
  );
  
  // Scrivi il file aggiornato
  fs.writeFileSync(versionFile, newContent, 'utf8');
  
  console.log(`✅ Versione aggiornata da ${currentVersion} a ${newVersion}`);
  
} catch (error) {
  console.error('Errore nell\'aggiornamento della versione:', error);
  process.exit(1);
}
