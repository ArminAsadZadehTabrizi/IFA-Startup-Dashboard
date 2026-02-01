import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnLoginPage = req.nextUrl.pathname.startsWith("/login")
  
  // Protect all routes except /login and public assets
  if (!isLoggedIn && !isOnLoginPage && !req.nextUrl.pathname.startsWith("/api/auth")) {
    const loginUrl = new URL("/login", req.url)
    return Response.redirect(loginUrl)
  }

  // Redirect to home if already logged in and trying to access login page
  if (isLoggedIn && isOnLoginPage) {
    return Response.redirect(new URL("/", req.url))
  }
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}


