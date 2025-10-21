// Versione dell'applicazione
export const APP_VERSION = '1.0.6';

// Funzione per incrementare la versione (patch)
export const incrementVersion = (currentVersion: string): string => {
  const parts = currentVersion.split('.');
  const major = parseInt(parts[0]);
  const minor = parseInt(parts[1]);
  const patch = parseInt(parts[2]);
  
  return `${major}.${minor}.${patch + 1}`;
};
