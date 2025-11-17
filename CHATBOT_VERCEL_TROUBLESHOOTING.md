# 🤖 Chatbot Vercel Troubleshooting Guide

## 🔴 Problem
Der AI Chatbot funktioniert lokal einwandfrei, zeigt aber auf Vercel (Production) folgende Fehlermeldung:

> "Entschuldigung, es gab einen Fehler bei der Verarbeitung deiner Anfrage. Bitte versuche es später erneut."

---

## 🔍 Diagnose

### Schritt 1: Überprüfe die Vercel Logs
1. Gehe zu [Vercel Dashboard](https://vercel.com/dashboard)
2. Wähle dein Projekt aus
3. Klicke auf "Deployments" → Letztes Deployment
4. Wähle "Functions" Tab
5. Klicke auf `/api/chat`
6. Schau dir die Logs an

**Typische Fehlermeldungen:**
- ❌ `Gemini API key not configured` → API Key fehlt
- ❌ `OpenAI API error` → Falscher Provider oder Key
- ❌ `Failed to read startup data` → Dateiproblem

### Schritt 2: Überprüfe Environment Variables
Die häufigste Ursache: **Fehlende oder falsch konfigurierte Umgebungsvariablen**

---

## ✅ Lösung

### 1️⃣ Gemini API Key besorgen

Falls du noch keinen hast:

1. Gehe zu **https://ai.google.dev/**
2. Melde dich mit deinem Google Account an
3. Klicke auf **"Get API Key"** oder **"API Keys"** im Menü
4. Erstelle einen neuen API Key:
   - Klicke auf **"Create API Key"**
   - Wähle ein Projekt oder erstelle ein neues
   - Kopiere den generierten Key (Format: `AIzaSy...`)

> **💡 Tipp:** Der Gemini API ist kostenlos für bis zu 1.500 Requests pro Tag!

### 2️⃣ Environment Variables auf Vercel konfigurieren

Gehe zu deinem Vercel Dashboard und füge folgende Variablen hinzu:

#### ✅ Erforderlich: GEMINI_API_KEY
```
Key:          GEMINI_API_KEY
Value:        AIzaSy... (dein API Key)
Environments: ✅ Production ✅ Preview ✅ Development
```

#### ⚙️ Optional: LLM_PROVIDER
```
Key:          LLM_PROVIDER
Value:        gemini
Environments: ✅ Production ✅ Preview ✅ Development
```

#### ⚙️ Optional: GEMINI_MODEL
```
Key:          GEMINI_MODEL
Value:        gemini-2.0-flash-exp
Environments: ✅ Production ✅ Preview ✅ Development
```

**Empfohlene Modelle (Stand Nov 2024):**
- `gemini-2.0-flash-exp` - Neueste experimentelle Version (sehr schnell)
- `gemini-2.5-flash` - Stabile Flash-Version
- `gemini-2.5-pro` - Höhere Qualität, etwas langsamer

### 3️⃣ Neu deployen

**WICHTIG:** Nach dem Hinzufügen von Environment Variables musst du neu deployen!

#### Option A: Über Vercel Dashboard (empfohlen)
1. Gehe zu **"Deployments"**
2. Klicke bei der letzten Deployment auf **"..."** (drei Punkte)
3. Wähle **"Redeploy"**
4. ✅ Wähle **"Use existing build cache"** (schneller) ODER
5. ✅ Deaktiviere Cache für vollständigen Rebuild
6. Klicke auf **"Redeploy"**

#### Option B: Über Git Push
```bash
# Lokale Änderungen committen (falls vorhanden)
git add .
git commit -m "Update: Environment configuration for chatbot"
git push origin main

# Vercel deployed automatisch nach jedem Push
```

### 4️⃣ Testen

1. ⏱ Warte 2-3 Minuten bis das Deployment abgeschlossen ist
2. 🌐 Öffne deine Vercel-URL im Browser
3. 💬 Öffne den Chatbot (unten rechts)
4. ✍️ Stelle eine Testfrage:
   - "Welche Startups gibt es?"
   - "Zeige mir alle Startups aus Berlin"
   - "Was macht das Startup XYZ?"
5. ✅ Der Chatbot sollte jetzt antworten!

---

## 🛠 Erweiterte Fehlerbehebung

### Problem: "API key not configured"

**Ursache:** Die Environment Variable `GEMINI_API_KEY` ist nicht gesetzt oder nicht sichtbar.

**Lösung:**
1. Überprüfe, ob `GEMINI_API_KEY` in Vercel Settings → Environment Variables existiert
2. Stelle sicher, dass **"Production"** Environment ausgewählt ist
3. Der API Key sollte mit `AIza` beginnen
4. Keine Leerzeichen am Anfang/Ende!
5. Nach Änderungen: **Redeploy** erforderlich!

### Problem: "Gemini API error: 400 Bad Request"

**Ursache:** Ungültiger API Key oder falsches Format.

**Lösung:**
1. Erstelle einen **neuen** API Key auf https://ai.google.dev/
2. Kopiere ihn vollständig (kein Copy-Paste-Fehler!)
3. Aktualisiere die Variable auf Vercel
4. Redeploy

### Problem: "Gemini API error: 403 Forbidden"

**Ursache:** API Key ist abgelaufen oder wurde deaktiviert.

**Lösung:**
1. Überprüfe auf https://ai.google.dev/, ob der Key noch aktiv ist
2. Falls deaktiviert: Erstelle einen neuen Key
3. Aktualisiere auf Vercel
4. Redeploy

### Problem: "Gemini API error: 429 Too Many Requests"

**Ursache:** Rate Limit erreicht (1.500 Requests/Tag im Free Tier).

**Lösung:**
- ⏰ Warte bis Mitternacht (UTC) - Reset erfolgt automatisch
- 💰 Upgrade zu einem bezahlten Plan auf https://ai.google.dev/pricing
- 📊 Implementiere besseres Rate Limiting im Code

### Problem: Chatbot antwortet, aber Daten fehlen

**Ursache:** Startup-Daten werden nicht korrekt geladen.

**Lösung:**
1. Überprüfe, ob `/public/data/startups.json` existiert
2. Überprüfe, ob `/public/data/ai-insights.json` existiert
3. Stelle sicher, dass beide Dateien deployed wurden
4. Schau in Vercel Logs nach "Failed to read startup data"

### Problem: Lokal funktioniert es, auf Vercel nicht

**Ursache:** Unterschiedliche Environment Variables zwischen lokal und Vercel.

**Lösung:**
1. Lokal: `.env.local` Datei mit allen Keys
2. Vercel: Settings → Environment Variables
3. Vergleiche beide - müssen identisch sein!
4. Teste mit: `npm run check-env` (lokal)

---

## 🧪 Lokale Überprüfung

### Check Environment Variables lokal

```bash
npm run check-env
```

Dieser Befehl überprüft:
- ✅ Ob `.env.local` existiert
- ✅ Ob alle erforderlichen Variablen gesetzt sind
- ✅ Ob die Werte gültig aussehen (maskiert für Sicherheit)

**Erwartete Ausgabe bei korrekter Konfiguration:**
```
🔍 Checking Chatbot Environment Configuration...

✅ .env.local file found
✅ LLM Provider
   LLM_PROVIDER: gemini
✅ Gemini API Key
   GEMINI_API_KEY: AIzaSy...3X2k
✅ Gemini Model
   GEMINI_MODEL: gemini-2.0-flash-exp

============================================================
✅ All environment variables are properly configured!
🚀 Chatbot is ready to use
```

### Test API Endpoint direkt

```bash
curl -X POST https://deine-vercel-url.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hallo", "history": []}'
```

**Erwartete Antwort:**
```json
{
  "message": "Hallo! Ich bin dein Impact Factory Startup-Assistent...",
  "timestamp": "2025-11-17T..."
}
```

**Fehlerhafte Antwort:**
```json
{
  "error": "Internal server error",
  "message": "Gemini API key not configured..."
}
```

---

## 📝 Checkliste für Deployment

Vor jedem Deployment:

- [ ] `.env.local` lokal vorhanden und korrekt?
- [ ] `npm run check-env` erfolgreich?
- [ ] Vercel Environment Variables gesetzt?
  - [ ] `GEMINI_API_KEY`
  - [ ] `LLM_PROVIDER` (optional: gemini)
  - [ ] `GEMINI_MODEL` (optional: gemini-2.0-flash-exp)
- [ ] Alle Environments ausgewählt? (Production, Preview, Development)
- [ ] Nach Änderungen redeployed?
- [ ] Chatbot auf Vercel getestet?

---

## 🔗 Nützliche Links

- **Gemini API:** https://ai.google.dev/
- **Gemini API Keys:** https://aistudio.google.com/app/apikey
- **Gemini Pricing:** https://ai.google.dev/pricing
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Logs:** https://vercel.com/docs/concepts/observability/runtime-logs
- **Vercel Environment Variables:** https://vercel.com/docs/concepts/projects/environment-variables

---

## 💡 Best Practices

### Sicherheit
- ❌ **Niemals** API Keys im Code committen!
- ✅ Immer Environment Variables verwenden
- ✅ `.env.local` ist in `.gitignore` (bereits konfiguriert)
- ✅ Keys regelmäßig rotieren (alle 3-6 Monate)

### Performance
- ✅ Rate Limiting im Frontend (20 Fragen/Tag/User)
- ✅ Gemini Flash-Modelle für schnelle Antworten
- ✅ Conversation History limitiert (letzte 5 Messages)

### Monitoring
- 📊 Vercel Analytics aktivieren
- 📊 Gemini API Usage auf https://ai.google.dev/ überwachen
- 📊 Error Logs regelmäßig prüfen

---

## 🆘 Immer noch Probleme?

Falls der Chatbot trotz aller Schritte nicht funktioniert:

1. **Screenshots sammeln:**
   - Vercel Environment Variables
   - Vercel Logs der `/api/chat` Function
   - Browser Console Errors (F12)

2. **Support kontaktieren:**
   - Gemini API: https://ai.google.dev/support
   - Vercel Support: https://vercel.com/support
   - GitHub Issues: Erstelle ein Issue im Projekt-Repository

3. **Temporärer Workaround:**
   - Deaktiviere den Chatbot vorübergehend:
     - Kommentiere `<Chatbot />` in `app/page.tsx` aus

---

**Letzte Aktualisierung:** 2025-11-17  
**Version:** 1.0  
**Autor:** AI Assistant

