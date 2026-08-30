const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// 관리자 상품 단건 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieHeader = request.headers.get("cookie") ?? "";

    const response = await fetch(
      `${API_BASE_URL}/api/v1/admin/products/${id}`,
      {
        cache: "no-store",
        headers: cookieHeader ? { cookie: cookieHeader } : {},
      }
    );

    if (!response.ok) {
      return Response.json(
        { message: "상품 조회 실패" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return Response.json(data);
  } catch (error) {
    console.error("상품 조회 실패:", error);

    return Response.json(
      { message: "상품 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 상품 수정
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const cookieHeader = request.headers.get("cookie") ?? "";

    const response = await fetch(
      `${API_BASE_URL}/api/v1/admin/products/${id}`,
      {
        method: "PUT",
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
        "상품 수정 실패:",
        response.status,
        errorText
      );

      return Response.json(
        { message: "상품 수정 실패" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return Response.json(data);
  } catch (error) {
    console.error("상품 수정 실패:", error);

    return Response.json(
      { message: "상품 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 상품 판매 중단
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieHeader = request.headers.get("cookie") ?? "";

    const response = await fetch(
      `${API_BASE_URL}/api/v1/admin/products/${id}`,
      {
        method: "DELETE",
        headers: cookieHeader ? { cookie: cookieHeader } : {},
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "상품 판매 중단 실패:",
        response.status,
        errorText
      );

      return Response.json(
        { message: "상품 판매 중단 실패" },
        { status: response.status }
      );
    }

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error("상품 판매 중단 실패:", error);

    return Response.json(
      { message: "상품 판매 중단 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}