// 상품 목록 조회
export async function GET() {
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/products",
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
        { message: "백엔드 서버 연결 실패" },
        { status: 500 }
      );
    }
  }
  
  // 상품 등록
  export async function POST(request: Request) {
    try {
      const body = await request.json();
  
      const response = await fetch(
        "http://localhost:8080/api/v1/admin/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        return Response.json(data, {
          status: response.status,
        });
      }
  
      return Response.json(data, {
        status: 201,
      });
    } catch (error) {
      console.error("상품 등록 실패:", error);
  
      return Response.json(
        { message: "상품 등록 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
  }