# Chatbot Setup Guide

## Übersicht

Der Chatbot ist ein integrierter Assistent im Impact Factory Startup Dashboard, der Fragen zu den Startups beantwortet. Er nutzt die lokalen JSON-Dateien (`/public/data/startups.json` und `/public/data/ai-insights.json`) und ein Large Language Model (LLM) zur Beantwortung.

## Architektur

```
Frontend (Repo B) ──> API Route (/api/chat) ──> Lokale JSON-Dateien
                              │                        │
                              │                        ├──> startups.json
                              │                        └──> ai-insights.json
                              │
                              └──> LLM (OpenAI oder Gemini)
```

**Vorteil**: Keine Backend-Abhängigkeit! Alle Daten sind lokal verfügbar.

## Setup-Schritte

### 1. Umgebungsvariablen konfigurieren

Erstelle eine `.env.local` Datei im Root-Verzeichnis:

```bash
cp .env.local.example .env.local
```

Bearbeite `.env.local` und füge deine API-Keys ein:

```env
# LLM Provider wählen
LLM_PROVIDER=openai  # oder 'gemini'

# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# ODER Gemini Configuration
# GEMINI_API_KEY=your_key_here
# GEMINI_MODEL=gemini-pro
```

### 2. Dependencies installieren

Falls noch nicht geschehen:

```bash
pnpm install
```

### 3. Development Server starten

```bash
pnpm dev
```

Der Chatbot erscheint automatisch als schwebender Button unten rechts auf allen Seiten.

## API-Endpoints

### `/api/chat` (POST)

**Request Body:**
```json
{
  "message": "Welche Startups arbeiten an Healthcare?",
  "history": [
    {
      "role": "user",
      "content": "Hallo"
    },
    {
      "role": "assistant",
      "content": "Hallo! Wie kann ich helfen?"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Es gibt mehrere Healthcare Startups...",
  "timestamp": "2025-11-12T10:30:00.000Z"
}
```

## Komponenten-Übersicht

### 1. `/components/chatbot.tsx`
- React-Komponente für die Chat-UI
- Floating Button + Chat-Fenster
- Nachrichtenverlauf und Eingabe
- Loading States

### 2. `/app/api/chat/route.ts`
- Next.js API Route Handler
- Liest Startup-Daten aus lokalen JSON-Dateien
- Kommuniziert mit OpenAI oder Gemini
- Bereitet Context für LLM auf (inkl. AI-Insights)

### 3. `/app/layout.tsx`
- Globale Integration des Chatbots
- Wird auf allen Seiten angezeigt

## LLM Provider

### OpenAI (Standard)

**Vorteile:**
- Sehr gute Antwortqualität
- Schnelle Antwortzeiten
- Zuverlässig

**Setup:**
1. Account erstellen: https://platform.openai.com/
2. API-Key generieren
3. In `.env.local` eintragen

### Gemini (Alternative)

**Vorteile:**
- Kostenlos für moderaten Gebrauch
- Google's neuestes Modell
- Gute multilingual Support

**Setup:**
1. Google AI Studio: https://ai.google.dev/
2. API-Key generieren
3. `LLM_PROVIDER=gemini` in `.env.local` setzen

## Anpassungen

### Chat-Verhalten ändern

Editiere die System-Nachricht in `/app/api/chat/route.ts`:

```typescript
const systemMessage = {
  role: "system",
  content: `Du bist ein hilfreicher Assistent...`
}
```

### Chat-UI stylen

Editiere `/components/chatbot.tsx`:
- Größe: `w-[400px] h-[600px]`
- Position: `bottom-6 right-6`
- Farben: `bg-primary`, `text-primary-foreground`

### Datenquelle ändern

Die Daten werden aus `/public/data/startups.json` und `/public/data/ai-insights.json` gelesen. Um andere Dateien zu nutzen, passe die Pfade in `/app/api/chat/route.ts` an:

```typescript
const startupsPath = join(process.cwd(), "public", "data", "your-file.json")
```

Falls du doch ein Backend anbinden möchtest, ersetze `fetchStartupData()` mit einem API-Call.

## Troubleshooting

### "Failed to get response"
- Überprüfe API-Keys in `.env.local`
- Schaue in Browser Console und Server Logs
- Stelle sicher, dass `/public/data/startups.json` existiert

### "OpenAI API key not configured"
- Stelle sicher, dass `.env.local` existiert
- Überprüfe, dass `OPENAI_API_KEY` gesetzt ist
- Restart dev server nach Änderungen

### "Error reading startup data"
- Überprüfe, ob `/public/data/startups.json` existiert
- Validiere JSON-Syntax der Dateien
- Schaue in Server Logs für Details

### Langsame Antworten
- Nutze `gpt-4o-mini` statt `gpt-4` (schneller & günstiger)
- Reduziere Anzahl der Startups im Context (aktuell: max 50)
- Verringere `max_tokens` in API-Call

## Deployment auf Vercel

1. Füge Environment Variables in Vercel Dashboard hinzu:
   - `LLM_PROVIDER` (z.B. `openai`)
   - `OPENAI_API_KEY` (oder `GEMINI_API_KEY`)
   - `OPENAI_MODEL` (optional, z.B. `gpt-4o-mini`)

2. Die JSON-Dateien in `/public/data/` werden automatisch mit deployed

3. Fertig! Keine weiteren Backend-Konfigurationen nötig

## Security Hinweise

⚠️ **Wichtig:**
- API-Keys NIEMALS im Client-Code verwenden
- Nur in API Routes (`/app/api/*`) verwenden
- `.env.local` niemals committen
- Rate Limiting für `/api/chat` in Production empfohlen

## Kosten

**OpenAI (gpt-4o-mini):**
- ~$0.15 per 1M input tokens
- ~$0.60 per 1M output tokens
- Beispiel: 1000 Chat-Nachrichten ≈ $1-2

**Gemini Pro:**
- Kostenlos bis zu 60 Requests/Minute
- Für mehr: Google Cloud Pricing

## Weiterführende Links

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [shadcn/ui Components](https://ui.shadcn.com/)

