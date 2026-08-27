import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    message: "관리자 로그아웃 성공",
  });

  response.cookies.set("admin-auth", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}