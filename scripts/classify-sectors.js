/**
 * Sektor-Klassifizierung basierend auf SDGs
 * 
 * Die 7 Sektoren:
 * 1. Kreislaufwirtschaft
 * 2. Klimaschutz & Erneuerbare Energien
 * 3. Ernährung & nachhaltige Landwirtschaft
 * 4. Gesundheit & Pflege
 * 5. Demokratie & resiliente Gesellschaft
 * 6. Bildung & Inklusion
 * 7. Lebenswerte Städte & Mobilität
 */

const fs = require('fs');
const path = require('path');

// SDG zu Sektor Mapping (Priorität nach Reihenfolge im Array)
const SDG_TO_SECTOR = {
  2: 'Ernährung & nachhaltige Landwirtschaft',    // Kein Hunger
  3: 'Gesundheit & Pflege',                       // Gesundheit und Wohlergehen
  4: 'Bildung & Inklusion',                       // Hochwertige Bildung
  6: 'Klimaschutz & Erneuerbare Energien',        // Sauberes Wasser
  7: 'Klimaschutz & Erneuerbare Energien',        // Bezahlbare und saubere Energie
  9: 'Lebenswerte Städte & Mobilität',            // Industrie, Innovation, Infrastruktur
  11: 'Lebenswerte Städte & Mobilität',           // Nachhaltige Städte und Gemeinden
  12: 'Kreislaufwirtschaft',                      // Verantwortungsvoller Konsum und Produktion
  13: 'Klimaschutz & Erneuerbare Energien',       // Maßnahmen zum Klimaschutz
  14: 'Klimaschutz & Erneuerbare Energien',       // Leben unter Wasser
  15: 'Klimaschutz & Erneuerbare Energien',       // Leben an Land
  
  // SDGs die eher zu "Demokratie & resiliente Gesellschaft" gehören
  1: 'Demokratie & resiliente Gesellschaft',      // Keine Armut
  5: 'Demokratie & resiliente Gesellschaft',      // Geschlechtergleichheit
  8: 'Demokratie & resiliente Gesellschaft',      // Menschenwürdige Arbeit und Wirtschaftswachstum
  10: 'Demokratie & resiliente Gesellschaft',     // Weniger Ungleichheiten
  16: 'Demokratie & resiliente Gesellschaft',     // Frieden, Gerechtigkeit und starke Institutionen
  17: 'Demokratie & resiliente Gesellschaft',     // Partnerschaften zur Erreichung der Ziele
};

// Sektor-Priorität (falls mehrere SDGs passen)
const SECTOR_PRIORITY = [
  'Kreislaufwirtschaft',
  'Klimaschutz & Erneuerbare Energien',
  'Ernährung & nachhaltige Landwirtschaft',
  'Gesundheit & Pflege',
  'Bildung & Inklusion',
  'Lebenswerte Städte & Mobilität',
  'Demokratie & resiliente Gesellschaft',
];

function classifyStartup(startup) {
  const sdgs = startup.sdgs || [];
  
  if (sdgs.length === 0) {
    // Fallback wenn keine SDGs vorhanden
    return 'Demokratie & resiliente Gesellschaft';
  }
  
  // Sammle alle möglichen Sektoren basierend auf den SDGs
  const possibleSectors = new Set();
  for (const sdg of sdgs) {
    const sector = SDG_TO_SECTOR[sdg];
    if (sector) {
      possibleSectors.add(sector);
    }
  }
  
  if (possibleSectors.size === 0) {
    return 'Demokratie & resiliente Gesellschaft';
  }
  
  // Wähle den Sektor mit der höchsten Priorität
  for (const sector of SECTOR_PRIORITY) {
    if (possibleSectors.has(sector)) {
      return sector;
    }
  }
  
  // Fallback
  return Array.from(possibleSectors)[0];
}

// Lade die Startups
const startupsPath = path.join(__dirname, '../public/data/startups.json');
const startups = JSON.parse(fs.readFileSync(startupsPath, 'utf8'));

console.log(`\n📊 Klassifiziere ${startups.length} Startups...\n`);

// Statistik vorher
const beforeStats = {};
startups.forEach(s => {
  beforeStats[s.sector] = (beforeStats[s.sector] || 0) + 1;
});

console.log('VORHER - Sektor-Verteilung:');
Object.entries(beforeStats).sort((a,b) => b[1] - a[1]).forEach(([s, c]) => {
  console.log(`  ${s}: ${c}`);
});

// Klassifiziere
startups.forEach(startup => {
  startup.sector = classifyStartup(startup);
});

// Statistik nachher
const afterStats = {};
startups.forEach(s => {
  afterStats[s.sector] = (afterStats[s.sector] || 0) + 1;
});

console.log('\n✅ NACHHER - Sektor-Verteilung:');
Object.entries(afterStats).sort((a,b) => b[1] - a[1]).forEach(([s, c]) => {
  console.log(`  ${s}: ${c}`);
});

// Speichere die aktualisierten Startups
fs.writeFileSync(startupsPath, JSON.stringify(startups, null, 2), 'utf8');

console.log(`\n💾 Startups wurden in ${startupsPath} gespeichert!\n`);

