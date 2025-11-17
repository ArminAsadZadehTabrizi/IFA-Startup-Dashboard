# ⚡ Chatbot Quick Fix - 5 Minuten

## Problem
Chatbot auf Vercel zeigt Fehler: "Entschuldigung, es gab einen Fehler..."

## Lösung in 4 Schritten

### 1️⃣ API Key besorgen (2 Min)
1. Öffne: https://ai.google.dev/
2. Login mit Google Account
3. Klicke "Get API Key" oder "Create API Key"
4. Kopiere den Key (beginnt mit `AIza...`)

### 2️⃣ Auf Vercel einfügen (1 Min)
1. Gehe zu: https://vercel.com/dashboard
2. Wähle dein Projekt
3. Klicke: **Settings** → **Environment Variables**
4. Klicke: **Add New**
5. Füge ein:
   ```
   Name:  GEMINI_API_KEY
   Value: AIzaSy... (dein kopierter Key)
   ```
6. Wähle alle aus: ✅ Production ✅ Preview ✅ Development
7. Klicke: **Save**

### 3️⃣ Neu deployen (1 Min)
1. Gehe zu: **Deployments** (oben)
2. Klicke beim neuesten Deployment auf **"..."** (drei Punkte rechts)
3. Klicke: **Redeploy**
4. Bestätige mit: **Redeploy**

### 4️⃣ Testen (1 Min)
1. Warte 2-3 Minuten (Deployment läuft)
2. Öffne deine Vercel-URL
3. Öffne den Chatbot (unten rechts)
4. Stelle Testfrage: "Welche Startups gibt es?"
5. ✅ Fertig!

---

## Alternative: Via Terminal

```bash
# 1. In Projektordner wechseln
cd ~/Desktop/Arbeit/Crawler\ Dashboard\ Global

# 2. .env.local erstellen
cp env.local.example .env.local

# 3. Bearbeiten (Füge deinen API Key ein)
nano .env.local

# 4. Lokal testen
npm run dev
# Öffne: http://localhost:3001

# 5. Auf Vercel deployen
git add .
git commit -m "Fix: Add Gemini API key"
git push origin main
```

---

## Immer noch Probleme?
Siehe: [CHATBOT_VERCEL_TROUBLESHOOTING.md](./CHATBOT_VERCEL_TROUBLESHOOTING.md)

---

**Zeit:** ~5 Minuten  
**Kosten:** Kostenlos (1.500 Requests/Tag)

