import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080";

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const response = await fetch(
      `${API_BASE_URL}/api/v1/admin/products/${id}/permanent`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "상품 영구 삭제 실패:",
        response.status,
        errorText
      );

      return NextResponse.json(
        {
          message: "상품 영구 삭제 실패",
        },
        {
          status: response.status,
        }
      );
    }

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error(
      "상품 영구 삭제 실패:",
      error
    );

    return NextResponse.json(
      {
        message:
          "상품 영구 삭제 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}