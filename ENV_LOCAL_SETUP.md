# 🔐 WICHTIG: .env.local Datei erstellen!

Da `.env.local` in `.gitignore` ist (aus Sicherheitsgründen), müssen Sie diese Datei manuell erstellen.

## Schnell-Setup für Development:

Erstellen Sie eine Datei namens `.env.local` im Root-Verzeichnis mit folgendem Inhalt:

```env
# Auth Configuration
NEXTAUTH_SECRET="KqP7X9vZmN3rT5yW8uB1cD4eF6gH2jK0lM9nP5qR7sT3uV6wX8yZ1a"
NEXTAUTH_URL="http://localhost:3001"

# Admin Credentials
# Username: admin
# Password: admin123 (BITTE IN PRODUCTION ÄNDERN!)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="$2b$10$3.Z.qb2tyLOs.X6tfmZiUe6p6meNTxGHAMi7yvYktXBlMAMTM1FPi"

# Gemini API Key (optional - falls vorhanden)
GEMINI_API_KEY=""
```

## Login-Daten für Development:
- **Benutzername:** `admin`
- **Passwort:** `admin123`

⚠️ **WICHTIG:** In Production MÜSSEN Sie ein sicheres Passwort verwenden!

## Eigenes Passwort erstellen:

```bash
node generate-password-hash.js IhrSicheresPasswort123
```

Kopieren Sie den generierten Hash und ersetzen Sie `ADMIN_PASSWORD_HASH` in `.env.local`.

---

Mehr Details finden Sie in **LOGIN_SETUP.md**

