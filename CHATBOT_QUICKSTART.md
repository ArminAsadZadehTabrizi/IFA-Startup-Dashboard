# 🚀 Chatbot Schnellstart

## ✅ Setup in 3 Minuten (Kostenlos mit Gemini)

### Schritt 1: API-Key besorgen

1. Gehe zu: **https://ai.google.dev/**
2. Klicke auf **"Get API key"**
3. Erstelle einen neuen API Key
4. **Kopiere den Key** (nur einmal sichtbar!)

### Schritt 2: Environment Variables erstellen

Erstelle eine Datei `.env.local` im Root-Verzeichnis:

```bash
# Kopiere env.local.example
cp env.local.example .env.local
```

Bearbeite `.env.local` und füge deinen Key ein:

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=dein-gemini-key-hier
GEMINI_MODEL=gemini-pro
```

**Oder nutze deinen bestehenden Google AI Key:**

```env
LLM_PROVIDER=gemini
GOOGLE_AI_API_KEY=AIzaSyA... # (REGENERIERE DEN KEY AUS SICHERHEITSGRÜNDEN!)
GEMINI_MODEL=gemini-pro
```

### Schritt 3: Dev Server starten

```bash
pnpm install  # falls noch nicht gemacht
pnpm dev
```

### Schritt 4: Testen! 🎉

- Öffne http://localhost:3000
- Klicke auf den Chat-Button unten rechts
- Stelle eine Frage, z.B. "Welche Healthcare Startups gibt es?"

## 💰 Kosten: **$0** (Kostenlos!)

### Gemini Free Tier:
- ✅ **1.500 Fragen pro Tag** kostenlos
- ✅ **Keine Kreditkarte erforderlich**
- ✅ Perfekt für Teams bis 10 Personen

### Eingebautes Rate Limiting:
- 📊 **20 Fragen pro Person pro Tag**
- 🔄 Reset um Mitternacht
- ⚠️ Warnung bei nur noch 5 Fragen übrig

## 📊 Was zeigt der Chatbot an?

Im Chat siehst du:
- ⚠️ Gelbe Warnung: "Noch X von 20 Fragen heute übrig" (bei ≤5 übrig)
- 🛑 Rote Warnung: "Tageslimit erreicht. Reset um Mitternacht"
- 💬 Send-Button deaktiviert bei Limit erreicht
- ℹ️ Hover über Send-Button: Zeigt verbleibende Fragen

## 🎯 Beispiel-Fragen

```
"Welche Startups arbeiten an Healthcare?"
"Zeige mir alle Startups aus München"
"Welche Startups haben SDG 3?"
"Was macht das Startup [Name]?"
"Gibt es neue Updates?"
"Welche Startups sind in Batch 13?"
```

## ⚙️ Rate Limit anpassen

Um das Limit zu ändern, editiere `/hooks/use-chat-rate-limit.ts`:

```typescript
const DAILY_LIMIT = 20 // Ändere diese Zahl
```

Empfohlene Werte:
- **10** = Sehr konservativ
- **20** = Ausgewogen (Standard)
- **50** = Großzügig für größere Teams

## 🚀 Deployment auf Vercel

### 1. Push zu GitHub

```bash
git add .
git commit -m "Add chatbot with Gemini"
git push
```

### 2. Vercel Dashboard

1. Gehe zu https://vercel.com/
2. Importiere dein Repo
3. Füge Environment Variables hinzu:
   - `LLM_PROVIDER` = `gemini`
   - `GEMINI_API_KEY` = `dein-key`
   - `GEMINI_MODEL` = `gemini-pro`

### 3. Deploy! 🎉

Fertig! Der Chatbot läuft jetzt live - **komplett kostenlos**.

## 🔐 Wichtige Sicherheitshinweise

⚠️ **NIEMALS:**
- API-Keys im Code committen
- API-Keys öffentlich teilen
- `.env.local` ins Git pushen (ist in .gitignore)

✅ **IMMER:**
- Keys nur in `.env.local` (lokal) oder Vercel Environment Variables (deployed)
- Keys regenerieren wenn versehentlich geteilt

## 🆘 Troubleshooting

### "Gemini API key not configured"
→ Prüfe ob `.env.local` existiert und `GEMINI_API_KEY` gesetzt ist
→ Restart dev server nach Änderungen: `pnpm dev`

### "Failed to get response"
→ Prüfe API-Key auf https://ai.google.dev/
→ Schaue in Browser Console (F12) für Fehler
→ Schaue in Terminal für Server Logs

### "Tageslimit erreicht"
→ Normal! Reset um Mitternacht
→ Oder erhöhe Limit in `use-chat-rate-limit.ts`

### API-Key funktioniert nicht
→ Stelle sicher, dass du einen **AI Studio Key** nutzt, nicht Google Cloud Console
→ Richtige URL: https://ai.google.dev/ (nicht console.cloud.google.com)

## 📞 Weitere Hilfe

Siehe ausführliche Dokumentation: `CHATBOT_SETUP.md`

## 🎊 Das war's!

Dein Chatbot ist jetzt:
- ✅ Eingerichtet
- ✅ Kostenlos
- ✅ Rate-Limited
- ✅ Bereit für Production

Viel Spaß! 🚀

