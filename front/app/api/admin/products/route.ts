import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// 관리자 상품 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = searchParams.get("page") ?? "0";
    const filter = searchParams.get("filter") ?? "ACTIVE";
    const search = searchParams.get("search") ?? "";

    let backendUrl = `${API_BASE_URL}/api/v1/admin/products?page=${page}&filter=${filter}`;
    if (search.trim()) {
      backendUrl += `&search=${encodeURIComponent(search.trim())}`;
    }

    const cookieHeader = request.headers.get("cookie") ?? "";

    const response = await fetch(
      backendUrl,
      {
        cache: "no-store",
        headers: cookieHeader ? { cookie: cookieHeader } : {},
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "상품 목록 조회 실패:",
        response.status,
        errorText
      );

      return NextResponse.json(
        { message: "상품 목록 조회 실패" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("상품 목록 조회 실패:", error);

    return NextResponse.json(
      { message: "상품 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 관리자 상품 등록
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookieHeader = request.headers.get("cookie") ?? "";

    const response = await fetch(
      `${API_BASE_URL}/api/v1/admin/products`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader ? { cookie: cookieHeader } : {}),
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "상품 등록 실패:",
        response.status,
        errorText
      );

      return NextResponse.json(
        { message: "상품 등록 실패" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: 201,
    });
  } catch (error) {
    console.error("상품 등록 실패:", error);

    return NextResponse.json(
      { message: "상품 등록 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}