import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req

  if (isLoggedIn) {
    return null
  }

  let callbackUrl = nextUrl.pathname
  if (nextUrl.search) {
    callbackUrl += nextUrl.search
  }

  const encodedCallbackUrl = encodeURIComponent(callbackUrl)

  if (nextUrl.pathname.startsWith("/dashboard") || 
      nextUrl.pathname.startsWith("/builder") || 
      nextUrl.pathname.startsWith("/forms")) {
    return Response.redirect(new URL(`/sign-in?callbackUrl=${encodedCallbackUrl}`, nextUrl))
  }
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/builder/:path*", 
    "/forms/:path*",
    "/api/forms/:path*",
  ],
}
 