import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 로그인 페이지는 인증 없이 접근 가능
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const adminAuth = request.cookies.get("admin-auth");

  // 인증되지 않은 경우 로그인 페이지로 이동
  if (adminAuth?.value !== "authenticated") {
    return NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};