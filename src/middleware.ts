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
      
      const onboarded = payload.onboarded as boolean | undefined;
      const paymentCompleted = payload.paymentCompleted as boolean | undefined;
      const brandVoiceCompleted = payload.brandVoiceCompleted as boolean | undefined;

      // Determine the next required step
      let nextStep = "/";
      if (!onboarded) {
        nextStep = "/onboarding";
      } else if (!paymentCompleted) {
        nextStep = "/payment";
      } else if (!brandVoiceCompleted) {
        nextStep = "/brand-voice";
      }

      // Skip middleware for API routes
      if (pathname.startsWith("/api/")) {
        return NextResponse.next();
      }

      // If user needs to complete steps and is not on the right page
      if (nextStep !== "/" && pathname !== nextStep) {
        // Allow users to go back in the flow (e.g., from payment to onboarding)
        const flowOrder = ["/onboarding", "/payment", "/brand-voice", "/"];
        const currentIndex = flowOrder.indexOf(pathname);
        const nextIndex = flowOrder.indexOf(nextStep);
        
        // Only redirect forward, not backward
        if (currentIndex === -1 || currentIndex > nextIndex) {
          return NextResponse.redirect(new URL(nextStep, request.url));
        }
      }

      // If user completed everything and trying to access intermediate steps, redirect home
      if (nextStep === "/" && ["/onboarding", "/payment", "/brand-voice"].includes(pathname)) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // If authenticated and trying to access register, redirect to next step
      if (pathname === "/register") {
        return NextResponse.redirect(new URL(nextStep, request.url));
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
