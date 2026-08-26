"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;
};

type ProductPage = {
  content: Product[];
  totalPages: number;
  number: number;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 상품 목록 조회
  useEffect(() => {
    fetch(`/api/admin/products?page=${page}`)

      .then((response) => {
        if (!response.ok) {
          throw new Error("상품 목록을 불러오지 못했습니다.");
        }

        return response.json();
      })

      .then((data: ProductPage) => {
        setProducts(data.content);
        setTotalPages(data.totalPages);
      })

      .catch((error) => {
        console.error("상품 조회 실패:", error);
        setError("상품 목록을 불러오지 못했습니다.");
      });

  }, [page]);

  // 상품 삭제
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "정말 이 상품을 삭제하시겠습니까?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/products/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("상품 삭제 실패");
      }

      // 삭제 성공한 상품을 현재 화면에서도 제거
      setProducts((prevProducts) =>
        prevProducts.filter(
          (product) => product.id !== id
        )
      );

      alert("상품이 삭제되었습니다.");
    } catch (error) {
      console.error("상품 삭제 실패:", error);
      alert("상품 삭제에 실패했습니다.");
    }
  };

  return (
    <div>
      {/* 페이지 상단 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">
            상품 관리
          </h1>

          <p className="text-neutral-500 mt-2">
            등록된 상품을 조회하고 상품 정보를 관리할 수 있습니다.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="bg-black text-white px-5 py-3 rounded hover:bg-neutral-800 transition"
        >
          + 상품 등록
        </Link>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* 상품 목록 */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr className="text-left text-sm text-neutral-500">
              <th className="p-4">번호</th>
              <th className="p-4">상품</th>
              <th className="p-4">가격</th>
              <th className="p-4">설명</th>
              <th className="p-4">관리</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product, index) => (
              <tr
                key={product.id}
                className="border-t border-neutral-200"
              >
                {/* 화면에 보여주는 순번 */}
                <td className="p-4">
                  {index + 1}
                </td>

                <td className="p-4">
                  {product.name}
                </td>

                <td className="p-4">
                  {product.price.toLocaleString()}원
                </td>

                <td className="p-4 text-neutral-600">
                  {product.description}
                </td>

                <td className="p-4">
                  {/* 수정할 때는 실제 DB ID 사용 */}
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="mr-4 hover:underline"
                  >
                    수정
                  </Link>

                  {/* 삭제할 때도 실제 DB ID 사용 */}
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    className="text-red-500 hover:underline cursor-pointer"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}

            {/* 상품이 하나도 없을 때 */}
            {products.length === 0 && !error && (
              <tr>
                <td
                  colSpan={5}
                  className="p-10 text-center text-neutral-400"
                >
                  등록된 상품이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* 페이징 */}
      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 0}
        >
          이전
        </button>

        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setPage(index)}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages - 1}
        >
          다음
        </button>
      </div>
    </div>
  );
}