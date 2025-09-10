// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Daftar path publik yang tidak perlu proteksi
const publicPaths = [
  "/",
  "/login",
  "/register",
  "/forgot-password/:path*",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/verify",
  "/api/public/:path*",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- 1. Skip middleware untuk path publik ---
  const isPublicPath = publicPaths.some(
    (publicPath) =>
      pathname === publicPath ||
      (publicPath.endsWith("*") &&
        pathname.startsWith(publicPath.slice(0, -2)))
  );
  if (isPublicPath) {
    return NextResponse.next();
  }

  // --- 2. Cek token login ---
  const token = req.cookies.get("token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // --- 3. Verify token ke API ---
    const verifyRes = await fetch(`${req.nextUrl.origin}/api/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!verifyRes.ok) throw new Error("Token verification failed");

    const { valid } = await verifyRes.json();
    if (!valid) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // --- 4. Role logic ---
    const selectedRole = req.cookies.get("selectedRole")?.value;

    // Kalau sudah login tapi belum pilih role → paksa ke /choose-role
    if (!selectedRole && !pathname.startsWith("/choose-role")) {
      return NextResponse.redirect(new URL("/choose-role", req.url));
    }

    // Kalau sudah pilih role → pastikan akses dashboard sesuai role
    if (selectedRole && pathname.startsWith("/dashboard")) {
      const roleFromPath = pathname.split("/")[2]; // contoh: /dashboard/admin → "admin"
      if (roleFromPath !== selectedRole) {
        return NextResponse.redirect(new URL("/choose-role", req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/choose-role",
    "/api/((?!public|auth).*)", // Protect all API except /api/public and /api/auth
  ],
};
