"use client";

import Link from "next/link";
import { addToCart, getCart } from "@/types/cart";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatKRW } from "@/lib/format";

type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
};

type ProductPage = {
  content: Product[];
  totalPages: number;
  number: number;
  totalElements: number;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [inputSearch, setInputSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);

  function refreshCount() {
    setCartCount(
      getCart().reduce((sum, item) => sum + item.quantity, 0)
    );
  }

  // 상품 데이터 페칭
  const fetchProducts = useCallback(
    async (targetPage: number, searchKeyword: string, isAppend = false) => {
      if (isAppend) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/products?page=${targetPage}`;
        if (searchKeyword.trim()) {
          url += `&search=${encodeURIComponent(searchKeyword.trim())}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("상품 목록 조회 실패");
        }

        const data: ProductPage = await response.json();

        if (isAppend) {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newItems = (data.content ?? []).filter(
              (p) => !existingIds.has(p.id)
            );
            return [...prev, ...newItems];
          });
        } else {
          setProducts(data.content ?? []);
        }

        setHasMore(targetPage < data.totalPages - 1);
      } catch (error) {
        console.error("상품 조회 실패:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  // 장바구니 수량 갱신
  useEffect(() => {
    refreshCount();
  }, []);

  // 엔터 키 등으로 검색어 제출 시 0페이지부터 다시 조회
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchProducts(0, submittedSearch, false);
  }, [submittedSearch, fetchProducts]);

  // 검색 폼 제출 핸들러 (엔터 키)
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmittedSearch(inputSearch.trim());
  };

  // 검색 초기화
  const handleClearSearch = () => {
    setInputSearch("");
    setSubmittedSearch("");
  };

  // 무한 스크롤 감지 (IntersectionObserver)
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchProducts(nextPage, submittedSearch, true);
            return nextPage;
          });
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    const currentTarget = observerRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadingMore, submittedSearch, fetchProducts]);

  function handleAdd(product: Product) {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
    });

    refreshCount();
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-[#F7F6F3]/90 px-6 py-4 backdrop-blur lg:px-12">
        <span className="text-lg font-semibold tracking-tight text-neutral-900">
          SHOP
        </span>

        <div className="flex items-center gap-5">
          {/* 관리자 인증 페이지로 이동 */}
          <Link
            href="/admin"
            className="text-sm text-neutral-700 transition hover:text-black"
          >
            관리자
          </Link>

          {/* 주문 조회 바로가기 */}
          <Link
            href="/orders"
            className="text-sm text-neutral-700 transition hover:text-black"
          >
            주문 조회
          </Link>

          <Link
            href="/cart"
            className="flex items-center gap-2 text-sm text-neutral-700 transition hover:text-black"
          >
            장바구니
            {cartCount > 0 && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white tabular-nums">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* 상품 목록 */}
      <main className="mx-auto max-w-6xl px-6 py-12 lg:px-12">
        {/* 상단 타이틀 & 실시간 검색창 */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-light text-neutral-900">
            New{" "}
            <em className="not-italic font-semibold">
              Arrivals
            </em>
          </h1>

          {/* 검색 입력창 및 검색 버튼 */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex w-full items-center gap-2 sm:w-auto"
          >
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={inputSearch}
                onChange={(e) => setInputSearch(e.target.value)}
                placeholder="상품 검색..."
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 pr-8 text-xs text-neutral-800 placeholder-neutral-400 outline-none transition focus:border-black focus:ring-1 focus:ring-black sm:text-sm"
              />
              {inputSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 transition hover:text-neutral-700"
                  title="검색어 지우기"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              className="shrink-0 cursor-pointer rounded-xl bg-[#1F1B18] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#342D28] sm:text-sm"
            >
              검색
            </button>
          </form>
        </div>

        {/* 상품 그리드 */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="group"
            >
              {/* 상품 이미지 */}
              <Link href={`/products/${product.id}`}>
                <div className="mb-3 aspect-[4/5] overflow-hidden rounded bg-neutral-100">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              </Link>

              {/* 상품명 */}
              <h3 className="text-sm font-light text-neutral-900">
                {product.name}
              </h3>

              {/* 가격 + 장바구니 */}
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-900">
                  {formatKRW(product.price)}
                </span>

                <button
                  type="button"
                  onClick={() => handleAdd(product)}
                  className="rounded-sm border border-black bg-black px-4 py-2 text-xs text-white transition hover:bg-neutral-800"
                >
                  담기
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 초기 로딩 중 스켈레톤/안내 */}
        {loading && products.length === 0 && (
          <div className="py-24 text-center text-sm text-neutral-400">
            상품 목록을 불러오는 중입니다...
          </div>
        )}

        {/* 상품이 없을 때 */}
        {!loading && products.length === 0 && (
          <div className="py-20 text-center text-sm text-neutral-400">
            {submittedSearch.trim()
              ? `"${submittedSearch}" 검색 결과와 일치하는 상품이 없습니다.`
              : "판매 중인 상품이 없습니다."}
          </div>
        )}

        {/* 무한 스크롤 센서 */}
        <div
          ref={observerRef}
          className="h-10 w-full"
        />

        {/* 다음 페이지 추가 로딩 스피너 */}
        {loadingMore && (
          <div className="py-6 text-center text-xs font-medium text-neutral-400">
            더 많은 상품을 불러오는 중...
          </div>
        )}

        {/* 더 이상 불러올 상품이 없을 때 */}
        {!hasMore && products.length > 0 && !loading && (
          <div className="mt-12 text-center text-xs text-neutral-400">
            모든 상품을 불러왔습니다.
          </div>
        )}
      </main>
    </div>
  );
}