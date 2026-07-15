import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.ADMIN_SECRET ?? "dev-insecure-admin-secret-change-me"
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protegido = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const apiAdmin = pathname.startsWith("/api/admin");
  if (!protegido && !apiAdmin) return NextResponse.next();

  const token = request.cookies.get("raiox_admin")?.value;
  let ok = false;
  if (token) {
    try {
      await jwtVerify(token, secret);
      ok = true;
    } catch {
      ok = false;
    }
  }

  if (!ok) {
    if (apiAdmin) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
