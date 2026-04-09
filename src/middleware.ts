import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE = "auth_token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  // Public routes that don't require auth
  const isPublicRoute = pathname === "/register" || pathname.startsWith("/api/auth");

  // If no token and trying to access protected route, redirect to register
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/register", request.url));
  }

  // If has token, verify it
  if (token) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set");
      return NextResponse.redirect(new URL("/register", request.url));
    }

    try {
      const key = new TextEncoder().encode(secret);
      const { payload } = await jwtVerify(token, key);
      
      // Check onboarding status via API call to backend
      // We'll add the onboarded flag to the JWT payload in the server
      const onboarded = payload.onboarded as boolean | undefined;

      // If user is authenticated but not onboarded, redirect to onboarding
      if (onboarded === false && pathname !== "/onboarding") {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }

      // If user is onboarded and trying to access onboarding page, redirect to home
      if (onboarded === true && pathname === "/onboarding") {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // If authenticated and trying to access register, redirect to appropriate page
      if (pathname === "/register") {
        const redirectUrl = onboarded ? "/" : "/onboarding";
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error("JWT verification failed:", error);
      // Invalid token, clear it and redirect to register
      const response = NextResponse.redirect(new URL("/register", request.url));
      response.cookies.delete(AUTH_COOKIE);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
