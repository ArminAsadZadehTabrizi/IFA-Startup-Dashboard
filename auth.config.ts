import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname === "/"
      const isOnLogin = nextUrl.pathname.startsWith("/login")

      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl))
      }
      return true
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

