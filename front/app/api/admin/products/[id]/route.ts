// 특정 상품 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await fetch(
      `http://localhost:8080/api/v1/products/${id}`,
      {
        cache: "no-store",
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

    const response = await fetch(
      `http://localhost:8080/api/v1/admin/products/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
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

// 상품 삭제
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await fetch(
      `http://localhost:8080/api/v1/admin/products/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "상품 삭제 실패:",
        response.status,
        errorText
      );

      return Response.json(
        { message: "상품 삭제 실패" },
        { status: response.status }
      );
    }

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error("상품 삭제 실패:", error);

    return Response.json(
      { message: "상품 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}