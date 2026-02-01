# 🔧 Ihre .env.local Datei sollte SO aussehen:

# ===== FÜR DEVELOPMENT (lokal auf Ihrem Computer) =====
# Auth Configuration
NEXTAUTH_SECRET="KqP7X9vZmN3rT5yW8uB1cD4eF6gH2jK0lM9nP5qR7sT3uV6wX8yZ1a"
NEXTAUTH_URL="http://localhost:3001"

# Admin Credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="$2b$10$N9RoOOcio4pkWoAc3tuPc.Id6Q0BxzGASaS9sIccYKjrgrbj5CEwu"

# Gemini API Key (optional)
GEMINI_API_KEY=""

# ===== WICHTIG =====
# - Für Development: NEXTAUTH_URL="http://localhost:3001"
# - Für Production (Vercel): NEXTAUTH_URL="https://ihre-app.vercel.app"
# - Sie brauchen immer NUR EINE URL zur gleichen Zeit!
# - Wenn Sie deployen, ändern Sie die URL in den Vercel Environment Variables

# ===== LOGIN DATEN =====
# Benutzername: admin
# Passwort: Anthropia0910

