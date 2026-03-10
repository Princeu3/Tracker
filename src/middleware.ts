import { auth } from "@/auth";
import { NextResponse } from "next/server";

const publicPaths = ["/signin", "/signup"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const isApiAuth = pathname.startsWith("/api/auth");

  if (isApiAuth) return NextResponse.next();

  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL("/signin", req.nextUrl));
  }

  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|public|favicon\\.ico|logo\\.png|og\\.png|icon-.*\\.png|apple-touch-icon\\.png|manifest\\.json|.*\\.svg).*)"],
};
