import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { adminCode } = await request.json();

    const savedAdminCode = process.env.ADMIN_CODE;

    if (!savedAdminCode) {
      console.error("ADMIN_CODE 환경변수가 설정되지 않았습니다.");

      return NextResponse.json(
        { message: "관리자 인증 설정 오류" },
        { status: 500 }
      );
    }

    if (!adminCode || adminCode !== savedAdminCode) {
      return NextResponse.json(
        { message: "관리자 코드가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      message: "관리자 인증 성공",
    });

    response.cookies.set("admin-auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 2, // 2시간
    });

    return response;
  } catch (error) {
    console.error("관리자 인증 실패:", error);

    return NextResponse.json(
      { message: "관리자 인증 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}