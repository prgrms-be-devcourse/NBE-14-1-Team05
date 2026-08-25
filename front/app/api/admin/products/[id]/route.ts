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
        "Spring 상품 삭제 실패:",
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
    console.error("상품 삭제 오류:", error);

    return Response.json(
      { message: "상품 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}