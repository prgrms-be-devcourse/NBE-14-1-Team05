"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
};

type ProductPage = {
  content: Product[];
  totalPages: number;
  number: number;
  totalElements: number;
  activeCount: number;
  inactiveCount: number;
  allCount: number;
};

type ProductFilter = "ACTIVE" | "INACTIVE" | "ALL";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [allCount, setAllCount] = useState(0);

  const [filter, setFilter] =
    useState<ProductFilter>("ACTIVE");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 상품 목록 조회
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/products?page=${page}&filter=${filter}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "상품 목록을 불러오지 못했습니다."
        );
      }

      const data: ProductPage =
        await response.json();

      setProducts(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);

      setActiveCount(data.activeCount);
      setInactiveCount(data.inactiveCount);
      setAllCount(data.allCount);
    } catch (error) {
      console.error("상품 조회 실패:", error);

      setError(
        "상품 목록을 불러오지 못했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 필터 변경
  const handleFilterChange = (
    newFilter: ProductFilter
  ) => {
    setFilter(newFilter);
    setPage(0);
  };

  // 판매 중단
  const handleDeactivate = async (
    id: number
  ) => {
    const confirmed = window.confirm(
      "이 상품의 판매를 중단하시겠습니까?"
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
        throw new Error(
          "상품 판매 중단 실패"
        );
      }

      alert("상품 판매가 중단되었습니다.");

      // 현재 페이지의 마지막 상품이면 이전 페이지로
      if (
        products.length === 1 &&
        page > 0
      ) {
        setPage((prev) => prev - 1);
        return;
      }

      await fetchProducts();
    } catch (error) {
      console.error(
        "상품 판매 중단 실패:",
        error
      );

      alert(
        "상품 판매 중단에 실패했습니다."
      );
    }
  };

  // 판매 재개
  const handleActivate = async (
    id: number
  ) => {
    const confirmed = window.confirm(
      "이 상품의 판매를 재개하시겠습니까?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/products/${id}/activate`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error(
          "상품 판매 재개 실패"
        );
      }

      alert("상품 판매가 재개되었습니다.");

      if (
        products.length === 1 &&
        page > 0
      ) {
        setPage((prev) => prev - 1);
        return;
      }

      await fetchProducts();
    } catch (error) {
      console.error(
        "상품 판매 재개 실패:",
        error
      );

      alert(
        "상품 판매 재개에 실패했습니다."
      );
    }
  };

  // 영구 삭제
  const handlePermanentDelete = async (
    id: number
  ) => {
    const confirmed = window.confirm(
      "이 상품을 완전히 삭제하시겠습니까?\n\n삭제 후에는 복구할 수 없습니다."
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/products/${id}/permanent`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          "상품 영구 삭제 실패:",
          response.status,
          errorText
        );

        throw new Error(
          "상품 영구 삭제 실패"
        );
      }

      alert("상품이 삭제되었습니다.");

      // 마지막 상품을 삭제했다면 이전 페이지로
      if (
        products.length === 1 &&
        page > 0
      ) {
        setPage((prev) => prev - 1);
        return;
      }

      await fetchProducts();
    } catch (error) {
      console.error(
        "상품 영구 삭제 실패:",
        error
      );

      alert(
        "상품 삭제에 실패했습니다.\n주문 내역에서 사용된 상품은 삭제할 수 없을 수 있습니다."
      );
    }
  };

  return (
    <div className="space-y-7">
      {/* 페이지 상단 */}
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
          <span className="text-lg font-light">
            +
          </span>
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
        {/* 상품 목록 헤더 */}
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h2 className="font-semibold text-neutral-900">
              상품 목록
            </h2>

            <p className="mt-1 text-sm text-neutral-400">
              상품의 판매 상태를 관리할 수
              있습니다.
            </p>
          </div>

          <div className="rounded-lg bg-[#F7F4F0] px-3 py-2 text-xs font-medium text-[#8A684A]">
            총 {loading ? "-" : allCount}개
          </div>
        </div>

        {/* 필터 */}
        <div className="flex gap-1 border-y border-neutral-100 px-6 pt-2">
          {/* 판매중 */}
          <button
            type="button"
            onClick={() =>
              handleFilterChange("ACTIVE")
            }
            className={`relative cursor-pointer px-4 py-3 text-sm font-medium transition ${
              filter === "ACTIVE"
                ? "text-neutral-900"
                : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            <span className="flex items-center gap-2">
              판매중

              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  filter === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {activeCount}
              </span>
            </span>

            {filter === "ACTIVE" && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#1F1B18]" />
            )}
          </button>

          {/* 판매중단 */}
          <button
            type="button"
            onClick={() =>
              handleFilterChange("INACTIVE")
            }
            className={`relative cursor-pointer px-4 py-3 text-sm font-medium transition ${
              filter === "INACTIVE"
                ? "text-neutral-900"
                : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            <span className="flex items-center gap-2">
              판매중단

              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  filter === "INACTIVE"
                    ? "bg-red-50 text-red-500"
                    : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {inactiveCount}
              </span>
            </span>

            {filter === "INACTIVE" && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#1F1B18]" />
            )}
          </button>

          {/* 전체 */}
          <button
            type="button"
            onClick={() =>
              handleFilterChange("ALL")
            }
            className={`relative cursor-pointer px-4 py-3 text-sm font-medium transition ${
              filter === "ALL"
                ? "text-neutral-900"
                : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            <span className="flex items-center gap-2">
              전체

              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  filter === "ALL"
                    ? "bg-neutral-200 text-neutral-700"
                    : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {allCount}
              </span>
            </span>

            {filter === "ALL" && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#1F1B18]" />
            )}
          </button>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-[#FAFAF9] text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <th className="w-20 px-6 py-4">
                  번호
                </th>

                <th className="w-72 px-6 py-4">
                  상품
                </th>

                <th className="w-40 px-6 py-4">
                  가격
                </th>

                <th className="px-6 py-4">
                  설명
                </th>

                <th className="w-32 px-6 py-4 text-center">
                  상태
                </th>

                <th className="w-64 px-6 py-4 text-center">
                  관리
                </th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                products.map(
                  (product, index) => (
                    <tr
                      key={product.id}
                      className={`border-t border-neutral-100 transition hover:bg-[#FCFBF9] ${
                        !product.isActive
                          ? "bg-neutral-50/50"
                          : ""
                      }`}
                    >
                      {/* 번호 */}
                      <td className="px-6 py-5 text-sm text-neutral-400">
                        {page * 10 +
                          index +
                          1}
                      </td>

                      {/* 상품 */}
                      <td className="px-6 py-5">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-[#F7F4F0]">
                            {product.imageUrl ? (
                              <img
                                src={
                                  product.imageUrl
                                }
                                alt={
                                  product.name
                                }
                                className={`h-full w-full object-cover ${
                                  product.isActive
                                    ? ""
                                    : "opacity-50 grayscale"
                                }`}
                              />
                            ) : (
                              <span className="text-xl text-neutral-300">
                                ◇
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p
                              className={`truncate font-semibold ${
                                product.isActive
                                  ? "text-neutral-900"
                                  : "text-neutral-400"
                              }`}
                            >
                              {
                                product.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-neutral-400">
                              ID #
                              {product.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 가격 */}
                      <td className="px-6 py-5">
                        <span
                          className={`whitespace-nowrap font-semibold ${
                            product.isActive
                              ? "text-neutral-800"
                              : "text-neutral-400"
                          }`}
                        >
                          {product.price.toLocaleString(
                            "ko-KR"
                          )}
                          원
                        </span>
                      </td>

                      {/* 설명 */}
                      <td className="px-6 py-5">
                        <p
                          className={`truncate text-sm ${
                            product.isActive
                              ? "text-neutral-500"
                              : "text-neutral-400"
                          }`}
                        >
                          {product.description ||
                            "-"}
                        </p>
                      </td>

                      {/* 상태 */}
                      <td className="px-6 py-5 text-center">
                        {product.isActive ? (
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            판매중
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                            판매중단
                          </span>
                        )}
                      </td>

                      {/* 관리 */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          {/* 수정 */}
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="whitespace-nowrap rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
                          >
                            수정
                          </Link>

                          {product.isActive ? (
                            // 판매중 상품
                            <button
                              type="button"
                              onClick={() =>
                                handleDeactivate(
                                  product.id
                                )
                              }
                              className="cursor-pointer whitespace-nowrap rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-100"
                            >
                              판매중단
                            </button>
                          ) : (
                            // 판매중단 상품
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleActivate(
                                    product.id
                                  )
                                }
                                className="cursor-pointer whitespace-nowrap rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-600 transition hover:bg-emerald-100"
                              >
                                판매재개
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handlePermanentDelete(
                                    product.id
                                  )
                                }
                                className="cursor-pointer whitespace-nowrap rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                              >
                                삭제
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )}

              {/* 로딩 */}
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-sm text-neutral-400"
                  >
                    상품 목록을 불러오는
                    중입니다.
                  </td>
                </tr>
              )}

              {/* 상품 없음 */}
              {!loading &&
                products.length === 0 &&
                !error && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center"
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-xl text-neutral-300">
                        ◇
                      </div>

                      <p className="mt-4 text-sm font-medium text-neutral-600">
                        {filter ===
                          "ACTIVE" &&
                          "판매 중인 상품이 없습니다."}

                        {filter ===
                          "INACTIVE" &&
                          "판매 중단된 상품이 없습니다."}

                        {filter ===
                          "ALL" &&
                          "등록된 상품이 없습니다."}
                      </p>
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
              현재 조건 총 {totalElements}개 ·{" "}
              {page + 1} / {totalPages} 페이지
            </p>

            <div className="flex items-center gap-1">
              {/* 이전 */}
              <button
                type="button"
                onClick={() =>
                  setPage((prev) =>
                    Math.max(0, prev - 1)
                  )
                }
                disabled={page === 0}
                className="cursor-pointer rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                이전
              </button>

              {/* 페이지 번호 */}
              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() =>
                      setPage(index)
                    }
                    className={`h-9 min-w-9 cursor-pointer rounded-lg px-3 text-sm font-medium transition ${
                      page === index
                        ? "bg-[#1F1B18] text-white"
                        : "text-neutral-500 hover:bg-neutral-100"
                    }`}
                  >
                    {index + 1}
                  </button>
                )
              )}

              {/* 다음 */}
              <button
                type="button"
                onClick={() =>
                  setPage((prev) =>
                    Math.min(
                      totalPages - 1,
                      prev + 1
                    )
                  )
                }
                disabled={
                  page >= totalPages - 1
                }
                className="cursor-pointer rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
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