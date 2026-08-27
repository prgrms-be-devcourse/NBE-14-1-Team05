import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await fetch(
      `${API_BASE_URL}/api/v1/admin/products/${id}/activate`,
      {
        method: "PATCH",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { message: "상품 판매 재개 실패" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("상품 판매 재개 실패:", error);

    return NextResponse.json(
      { message: "상품 판매 재개 실패" },
      { status: 500 }
    );
  }
}