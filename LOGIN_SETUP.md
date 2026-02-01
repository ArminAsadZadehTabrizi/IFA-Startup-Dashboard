# 🔐 Login-Funktionalität Setup Guide

## Übersicht

Das Dashboard ist jetzt mit einer Login-Funktionalität geschützt. Nur authentifizierte Benutzer können auf die Daten zugreifen.

## ✅ Implementierte Features

1. **NextAuth.js v5** Integration
2. **Sichere Passwort-Authentifizierung** mit bcrypt
3. **Session Management** über Middleware
4. **Login-Seite** mit modernem UI
5. **Logout-Funktionalität** im Dashboard-Header
6. **Automatische Weiterleitung** für nicht-authentifizierte Benutzer

---

## 🚀 Setup-Anleitung

### 1. Umgebungsvariablen konfigurieren

Erstellen Sie eine `.env.local` Datei im Root-Verzeichnis:

```bash
# 1. NEXTAUTH_SECRET generieren
openssl rand -base64 32
```

Kopieren Sie den generierten String und fügen Sie ihn ein:

```env
NEXTAUTH_SECRET="hier-den-generierten-string-einfügen"
NEXTAUTH_URL="http://localhost:3001"

# Admin Credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH=""
```

### 2. Admin-Passwort Hash generieren

Führen Sie das Passwort-Hash-Generator-Skript aus:

```bash
node generate-password-hash.js MeinSicheresPasswort123
```

Das Skript gibt einen bcrypt Hash aus. Kopieren Sie diesen Hash und fügen Sie ihn in `.env.local` ein:

```env
ADMIN_PASSWORD_HASH="$2a$10$abcd1234..."
```

### 3. Vollständige .env.local Beispiel

```env
# Auth Configuration
NEXTAUTH_SECRET="KqP7X9vZmN3rT5yW8uB1cD4eF6gH2jK0lM9nP5qR7sT3uV6wX8yZ1a"
NEXTAUTH_URL="http://localhost:3001"

# Admin Credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="$2a$10$N9qo8uPXelCT.ZHJzVgTaeXcB5c2v8ZKqVW9KqN8YZJqH7V8WZJqe"

# Gemini API Key (optional)
GEMINI_API_KEY="your-gemini-api-key"
```

---

## 🔧 Verwendung

### Login

1. Navigieren Sie zu `http://localhost:3001`
2. Sie werden automatisch zur Login-Seite weitergeleitet
3. Geben Sie die Anmeldedaten ein:
   - **Benutzername:** `admin` (oder wie in ADMIN_USERNAME konfiguriert)
   - **Passwort:** Das Passwort, das Sie beim Hash-Generieren verwendet haben
4. Klicken Sie auf "Anmelden"

### Logout

Klicken Sie auf den **"Abmelden"** Button im Dashboard-Header (oben rechts).

---

## 🏗️ Architektur

### Dateien und ihre Funktionen

```
├── auth.config.ts              # NextAuth Konfiguration
├── auth.ts                      # NextAuth Handler Export
├── middleware.ts                # Route Protection Middleware
├── generate-password-hash.js    # Passwort-Hash Generator
├── app/
│   ├── layout.tsx              # SessionProvider Wrapper
│   ├── page.tsx                # Dashboard (geschützt) + Logout Button
│   ├── login/
│   │   └── page.tsx            # Login-Seite
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts    # NextAuth API Handler
```

### Sicherheits-Features

1. **Bcrypt Password Hashing:** Passwörter werden nie im Klartext gespeichert
2. **Session-basierte Authentifizierung:** Sichere Session Cookies
3. **Middleware Protection:** Alle Routes außer `/login` sind geschützt
4. **Automatische Redirects:** Nicht-authentifizierte User → Login, Authentifizierte User → Dashboard

---

## 🌐 Production Deployment

### Vercel / Production

1. Fügen Sie die Umgebungsvariablen in Vercel hinzu:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (z.B. `https://your-domain.com`)
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD_HASH`

2. Stellen Sie sicher, dass `NEXTAUTH_URL` auf Ihre Production-Domain zeigt

### Sicherheits-Checkliste

- ✅ Verwenden Sie ein starkes `NEXTAUTH_SECRET` (mindestens 32 Zeichen)
- ✅ Verwenden Sie ein starkes Admin-Passwort (mindestens 12 Zeichen, Groß-/Kleinbuchstaben, Zahlen, Sonderzeichen)
- ✅ Teilen Sie niemals Ihre `.env.local` Datei
- ✅ Fügen Sie `.env.local` zu `.gitignore` hinzu
- ✅ Rotieren Sie regelmäßig Passwörter und Secrets

---

## 🔄 Passwort ändern

Um das Admin-Passwort zu ändern:

1. Generieren Sie einen neuen Hash:
   ```bash
   node generate-password-hash.js NeuesPasswort123
   ```

2. Aktualisieren Sie `ADMIN_PASSWORD_HASH` in `.env.local`

3. Starten Sie den Development Server neu:
   ```bash
   pnpm dev
   ```

---

## 🐛 Troubleshooting

### "Invalid credentials" beim Login

- Überprüfen Sie, ob `ADMIN_USERNAME` und das Passwort korrekt sind
- Stellen Sie sicher, dass der `ADMIN_PASSWORD_HASH` korrekt generiert wurde
- Überprüfen Sie die Browser-Console auf Fehler

### Endlose Redirect-Schleife

- Überprüfen Sie, ob `NEXTAUTH_SECRET` gesetzt ist
- Überprüfen Sie, ob `NEXTAUTH_URL` korrekt ist
- Löschen Sie Browser Cookies und versuchen Sie es erneut

### Session verloren nach Reload

- Stellen Sie sicher, dass `NEXTAUTH_SECRET` gesetzt ist
- Ändern Sie nicht `NEXTAUTH_SECRET` während aktiver Sessions

---

## 📚 Weitere Informationen

- [NextAuth.js Dokumentation](https://next-auth.js.org/)
- [bcrypt Dokumentation](https://www.npmjs.com/package/bcryptjs)

---

## 🎯 Nächste Schritte (Optional)

- [ ] Mehrere Benutzer-Accounts unterstützen (Datenbank)
- [ ] Rollen-basierte Zugriffskontrolle (Admin, Viewer, etc.)
- [ ] Password Reset Funktionalität
- [ ] Two-Factor Authentication (2FA)
- [ ] Audit Logging für Login-Versuche

