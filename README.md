# Impact Startups Dashboard - Frontend

Ein eigenständiges Frontend-Dashboard zur Visualisierung und Analyse von Impact-Startup-Daten.

## 📋 Beschreibung

Dies ist ein **reines Frontend-Projekt** basierend auf Next.js 14, das Startup-Daten aus statischen JSON-Dateien lädt und in einem modernen Dashboard visualisiert.

**Hinweis:** Dieses Projekt enthält **keine Backend-Funktionalität**, **keine Salesforce-Integration** und **keine KI-Features** (Gemini, Google Search Grounding, Crawling). Es ist ausschließlich für die Darstellung bereits gecrawlter Daten konzipiert.

## 🚀 Deployment auf Vercel

### Voraussetzungen

- Node.js 18+ installiert
- Ein Vercel-Account (kostenlos unter [vercel.com](https://vercel.com))

### Schnellstart

1. **Projekt vorbereiten**

```bash
cd ~/Desktop/Arbeit/Crawler\ Dashboard\ Global
npm install
```

2. **Lokal testen**

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

3. **Build testen**

```bash
npm run build
npm start
```

### Deployment-Schritte für Vercel

#### Option 1: Deployment via Vercel CLI (Empfohlen)

```bash
# Vercel CLI installieren (falls noch nicht installiert)
npm install -g vercel

# In das Projektverzeichnis wechseln
cd ~/Desktop/Arbeit/Crawler\ Dashboard\ Global

# Deployment starten
vercel

# Für Production-Deployment
vercel --prod
```

#### Option 2: Deployment via Vercel Dashboard

1. Gehe zu [vercel.com/new](https://vercel.com/new)
2. Klicke auf "Add New Project"
3. Wähle "Import Git Repository" ODER nutze "Deploy from GitHub"
4. Falls du das Projekt lokal hast:
   - Erstelle ein Git-Repository:
   ```bash
   cd ~/Desktop/Arbeit/Crawler\ Dashboard\ Global
   git init
   git add .
   git commit -m "Initial commit"
   ```
   - Pushe zu GitHub/GitLab
   - Verbinde das Repository mit Vercel

5. **Build & Output Settings** (werden automatisch erkannt):
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

6. Klicke auf "Deploy"

### Environment Variables (Optional)

Dieses Projekt benötigt **keine** Environment Variables für das Deployment.

## 📊 Daten aktualisieren

Die Daten werden aus statischen JSON-Dateien geladen:

- `public/data/startups.json` - Startup-Daten
- `public/data/crawl-runs.json` - Crawl-Verlauf
- `public/data/sdgs.json` - SDG-Definitionen

**Um Daten zu aktualisieren:**

1. Ersetze die JSON-Dateien in `public/data/` mit aktualisierten Daten
2. Stelle sicher, dass die Datenstruktur unverändert bleibt (siehe `lib/types.ts`)
3. Committe und pushe die Änderungen (bei Git-basiertem Deployment)
4. Vercel deployt automatisch bei jedem Push

**Manuelles Update:**

```bash
# Dateien bearbeiten
nano public/data/startups.json

# Neu deployen
vercel --prod
```

## 🛠️ Technologie-Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** React 18, TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** Radix UI, shadcn/ui
- **Charts:** Recharts
- **Fonts:** Geist Sans & Mono
- **Analytics:** Vercel Analytics

## 📁 Projektstruktur

```
├── app/
│   ├── layout.tsx          # Root Layout
│   ├── page.tsx            # Dashboard-Seite
│   └── globals.css         # Globale Styles
├── components/
│   ├── dashboard/          # Dashboard-Komponenten
│   ├── ui/                 # UI-Komponenten (shadcn)
│   └── crawler-simulation.tsx
├── hooks/
│   ├── use-dashboard-data.ts  # Data Fetching Hooks
│   └── use-crawler.ts
├── lib/
│   ├── types.ts            # TypeScript Typen
│   └── utils.ts            # Utility-Funktionen
├── public/
│   ├── data/               # ⚠️ Statische Daten-JSONs
│   └── images/             # Bilder und Assets
├── package.json
├── next.config.mjs
└── vercel.json             # Vercel-Konfiguration
```

## 🔧 Entwicklung

### Verfügbare Scripts

```bash
npm run dev      # Development Server (Port 3000)
npm run build    # Production Build
npm run start    # Production Server
npm run lint     # ESLint
```

### Neue Features hinzufügen

Da dies ein reines Frontend-Projekt ist, kannst du:
- ✅ UI-Komponenten hinzufügen/anpassen
- ✅ Datenvisualisierungen erweitern
- ✅ Filter und Sortierungen verbessern
- ✅ Neue statische Seiten hinzufügen

Du **kannst nicht**:
- ❌ Backend-APIs hinzufügen (Next.js API Routes funktionieren, aber Vercel hat Limits)
- ❌ Salesforce-Integrationen nutzen
- ❌ KI-Features (Gemini) verwenden
- ❌ Daten crawlen

Für Backend-Funktionen siehe das Original-Projekt im lokalen Ordner.

## 🐛 Troubleshooting

### "Failed to load data"

- Überprüfe, ob die JSON-Dateien in `public/data/` vorhanden sind
- Stelle sicher, dass die Dateien valides JSON enthalten
- Prüfe die Browser-Console für Details

### Build-Fehler

```bash
# Cache löschen und neu builden
rm -rf .next
npm run build
```

### TypeScript-Fehler

```bash
# TypeScript-Check
npx tsc --noEmit
```

## 📝 Lizenz

Dieses Projekt ist für interne Nutzung bestimmt.

## 🤝 Support

Bei Fragen oder Problemen:
- Prüfe die Browser-Console für Fehler
- Überprüfe die Vercel Deployment-Logs
- Stelle sicher, dass alle Abhängigkeiten installiert sind

## 🔄 Von Local zu Global

Dieses Projekt wurde vom lokalen Monorepo (`ifa-startup-dashboard`) getrennt, um ein eigenständiges, deploy-fähiges Frontend zu erstellen.

**Unterschiede zum Original:**
- ✅ Keine Backend-Abhängigkeiten
- ✅ Statische Daten statt Salesforce-API
- ✅ Vereinfachte package.json
- ✅ Vercel-optimiert

---

**Version:** 1.0.0  
**Erstellt:** November 2025





