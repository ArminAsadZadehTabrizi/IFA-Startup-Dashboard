# 🔧 Chatbot Deployment Fix für Vercel

## Problem
Der Chatbot funktioniert lokal, zeigt aber auf Vercel die Fehlermeldung:
> "Entschuldigung, es gab einen Fehler bei der Verarbeitung deiner Anfrage. Bitte versuche es später erneut."

## Ursache
Die Umgebungsvariable `GEMINI_API_KEY` ist auf Vercel nicht konfiguriert oder falsch gesetzt.

## ✅ Lösung: Umgebungsvariablen auf Vercel konfigurieren

### Schritt 1: Gemini API Key besorgen (falls noch nicht vorhanden)
1. Gehe zu: https://ai.google.dev/
2. Melde dich mit deinem Google Account an
3. Klicke auf "Get API Key" 
4. Erstelle einen neuen API Key für dein Projekt
5. Kopiere den API Key (sieht aus wie: `AIzaSy...`)

### Schritt 2: Umgebungsvariablen auf Vercel setzen
1. Gehe zu deinem **Vercel Dashboard**: https://vercel.com/dashboard
2. Wähle dein Projekt aus (Crawler Dashboard Global)
3. Klicke auf **"Settings"** (oben rechts)
4. Navigiere zu **"Environment Variables"** im linken Menü
5. Füge folgende Variablen hinzu:

#### Variable 1: GEMINI_API_KEY (ERFORDERLICH)
- **Key**: `GEMINI_API_KEY`
- **Value**: Dein Gemini API Key (z.B. `AIzaSy...`)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development (alle auswählen)

#### Variable 2: LLM_PROVIDER (OPTIONAL)
- **Key**: `LLM_PROVIDER`
- **Value**: `gemini`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### Variable 3: GEMINI_MODEL (OPTIONAL)
- **Key**: `GEMINI_MODEL`
- **Value**: `gemini-2.0-flash-exp` (oder `gemini-2.5-flash`)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### Schritt 3: Neu deployen
Nach dem Hinzufügen der Umgebungsvariablen musst du das Projekt **neu deployen**:

**Option A: Über das Vercel Dashboard**
1. Gehe zu **"Deployments"**
2. Klicke bei der letzten Deployment auf die drei Punkte (•••)
3. Wähle **"Redeploy"**
4. Bestätige mit **"Redeploy"**

**Option B: Über Git Push**
```bash
git add .
git commit -m "Fix: Add Gemini API configuration"
git push origin main
```

### Schritt 4: Testen
1. Warte bis das Deployment abgeschlossen ist (~2-3 Minuten)
2. Öffne deine Vercel-URL im Browser
3. Öffne den Chatbot
4. Stelle eine Testfrage (z.B. "Welche Startups gibt es?")
5. ✅ Der Chatbot sollte jetzt funktionieren!

## 🔍 Troubleshooting

### Problem: Chatbot zeigt immer noch Fehler
**Lösung:**
1. Öffne die Browser Console (F12 → Console Tab)
2. Öffne den Chatbot und stelle eine Frage
3. Schau dir die Fehlermeldung in der Console an
4. Überprüfe die Vercel Logs:
   - Gehe zu Vercel Dashboard → Dein Projekt → "Deployments"
   - Klicke auf das letzte Deployment
   - Wähle "Functions" Tab → "/api/chat"
   - Schau dir die Logs an

### Problem: "API key not configured"
**Lösung:**
- Die Umgebungsvariable `GEMINI_API_KEY` fehlt oder ist falsch
- Überprüfe in Vercel Settings → Environment Variables
- Stelle sicher, dass der Key korrekt ist (keine Leerzeichen, vollständig kopiert)
- Neu deployen nach Änderungen

### Problem: "Gemini API error: 400"
**Lösung:**
- Der API Key ist ungültig oder abgelaufen
- Erstelle einen neuen API Key auf https://ai.google.dev/
- Aktualisiere die Variable auf Vercel
- Neu deployen

### Problem: "Gemini API error: 429" (Rate Limit)
**Lösung:**
- Du hast das kostenlose Rate Limit von Gemini erreicht (1.500 Requests/Tag)
- Warte bis Mitternacht (UTC) für Reset
- ODER wechsle zu einem bezahlten Plan auf https://ai.google.dev/pricing

## 📊 Überprüfen der aktuellen Konfiguration

Um zu sehen, welche Umgebungsvariablen auf Vercel gesetzt sind:
1. Vercel Dashboard → Dein Projekt → "Settings" → "Environment Variables"
2. Du solltest mindestens `GEMINI_API_KEY` sehen

## 🆘 Weiterhin Probleme?

Falls der Chatbot weiterhin nicht funktioniert:

1. **Überprüfe die Vercel Logs:**
   ```
   vercel logs <deine-deployment-url>
   ```

2. **Teste den API Endpoint direkt:**
   - Öffne: `https://deine-vercel-url.vercel.app/api/chat`
   - Du solltest eine Fehlermeldung sehen (weil kein POST Body)
   - Falls "500 Internal Server Error" → API Key Problem
   - Falls "405 Method Not Allowed" → API funktioniert, aber erwartet POST

3. **Kontaktiere Support:**
   - Gemini API: https://ai.google.dev/support
   - Vercel Support: https://vercel.com/support

## ✨ Verbesserungen in diesem Update

- ✅ Besseres Error Handling im Backend (`/app/api/chat/route.ts`)
- ✅ Spezifischere Fehlermeldungen im Frontend (`/components/chatbot.tsx`)
- ✅ API-Key-Fehler werden nun deutlich angezeigt
- ✅ Detailliertes Error Logging für Debugging

---

**Autor:** AI Assistant  
**Datum:** 2025-11-17  
**Version:** 1.0

