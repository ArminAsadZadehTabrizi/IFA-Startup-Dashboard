import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// Public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/news",
  "/unsubscribe",
  "/api/news",
  "/api/newsletter/subscribe",
  "/api/newsletter/unsubscribe",
]

export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      // Check if current route is public
      const isOnPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

      // Allow access to public routes
      if (isOnPublicRoute) {
        return true
      }

      // Allow access if logged in
      if (isLoggedIn) {
        return true
      }

      // Redirect to login for protected routes
      return false
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const { username, password } = credentials as {
          username: string
          password: string
        }

        // Get admin credentials from environment variables
        const adminUsername = process.env.ADMIN_USERNAME || "admin"
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

        if (!adminPasswordHash) {
          console.error("ADMIN_PASSWORD_HASH not configured")
          return null
        }

        // Check username
        if (username !== adminUsername) {
          return null
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, adminPasswordHash)

        if (!isValidPassword) {
          return null
        }

        // Return user object if credentials are valid
        return {
          id: "admin",
          name: "Admin",
          email: "admin@impactfactory.de",
        }
      },
    }),
  ],
} satisfies NextAuthConfig

