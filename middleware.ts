import { auth } from "@/auth"

// Public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/news",
  "/unsubscribe",
  "/api/news",
  "/api/newsletter/subscribe",
  "/api/newsletter/unsubscribe",
]

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const pathname = req.nextUrl.pathname
  
  // Check if current route is public
  const isOnPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // Allow access to public routes and auth endpoints
  if (isOnPublicRoute || pathname.startsWith("/api/auth")) {
    return
  }

  // Redirect to login if not logged in
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url)
    return Response.redirect(loginUrl)
  }

  // Redirect to home if already logged in and trying to access login page
  if (isLoggedIn && pathname.startsWith("/login")) {
    return Response.redirect(new URL("/", req.url))
  }
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}


