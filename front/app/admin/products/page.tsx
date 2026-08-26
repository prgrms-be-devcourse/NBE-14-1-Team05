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
  totalElements?: number;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // 상품 목록 조회
  useEffect(() => {
    setLoading(true);
    setError("");

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
        setTotalElements(data.totalElements ?? data.content.length);
      })
      .catch((error) => {
        console.error("상품 조회 실패:", error);
        setError("상품 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        setLoading(false);
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

    const previousProducts = products;

    // 화면에서는 먼저 제거
    setProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== id)
    );

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("상품 삭제 실패");
      }

      setTotalElements((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("상품 삭제 실패:", error);

      setProducts(previousProducts);

      alert("상품 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-7">
      {/* 상단 */}
      <div className="flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-[#9A7655]">
            PRODUCTS
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            상품 관리
          </h1>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#1F1B18] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#342D28]"
        >
          <span className="text-lg font-light">+</span>
          새 상품 등록
        </Link>
      </div>

      {/* 에러 */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* 상품 목록 */}
      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {/* 목록 헤더 */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
          <div>
            <h2 className="font-semibold text-neutral-900">
              전체 상품
            </h2>

            <p className="mt-1 text-sm text-neutral-400">
              등록된 상품 {loading ? "-" : totalElements}개
            </p>
          </div>

          <div className="rounded-lg bg-[#F7F4F0] px-3 py-2 text-xs font-medium text-[#8A684A]">
            총 {loading ? "-" : totalElements}개
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FAFAF9] text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <th className="w-20 px-6 py-4">
                  번호
                </th>

                <th className="px-6 py-4">
                  상품
                </th>

                <th className="w-40 px-6 py-4">
                  가격
                </th>

                <th className="px-6 py-4">
                  설명
                </th>

                <th className="w-40 px-6 py-4 text-center">
                  관리
                </th>
              </tr>
            </thead>

            <tbody>
              {products.map((product, index) => (
                <tr
                  key={product.id}
                  className="border-t border-neutral-100 transition hover:bg-[#FCFBF9]"
                >
                  {/* 번호 */}
                  <td className="px-6 py-5 text-sm text-neutral-400">
                    {page * 6 + index + 1}
                  </td>

                  {/* 상품 */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      {/* 이미지 */}
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-[#F7F4F0]">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xl text-neutral-300">
                            ◇
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-neutral-900">
                          {product.name}
                        </p>

                        <p className="mt-1 text-xs text-neutral-400">
                          ID #{product.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* 가격 */}
                  <td className="px-6 py-5">
                    <span className="font-semibold text-neutral-800">
                      {product.price.toLocaleString("ko-KR")}원
                    </span>
                  </td>

                  {/* 설명 */}
                  <td className="max-w-sm px-6 py-5">
                    <p className="truncate text-sm text-neutral-500">
                      {product.description || "-"}
                    </p>
                  </td>

                  {/* 관리 */}
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                      >
                        수정
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className="cursor-pointer rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-500 transition hover:border-red-200 hover:bg-red-100"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* 로딩 */}
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-sm text-neutral-400"
                  >
                    상품 목록을 불러오는 중입니다.
                  </td>
                </tr>
              )}

              {/* 상품 없음 */}
              {!loading && products.length === 0 && !error && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-xl text-neutral-300">
                      ◇
                    </div>

                    <p className="mt-4 text-sm font-medium text-neutral-600">
                      등록된 상품이 없습니다.
                    </p>

                    <Link
                      href="/admin/products/new"
                      className="mt-3 inline-block text-sm font-medium text-[#8A684A] hover:underline"
                    >
                      첫 상품 등록하기 →
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이징 */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-neutral-100 px-6 py-4">
            <p className="text-xs text-neutral-400">
              {page + 1} / {totalPages} 페이지
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                이전
              </button>

              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setPage(index)}
                  className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition ${
                    page === index
                      ? "bg-[#1F1B18] text-white"
                      : "text-neutral-500 hover:bg-neutral-100"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages - 1}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}