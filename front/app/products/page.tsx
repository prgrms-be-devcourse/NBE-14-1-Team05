"use client";

import Link from "next/link";
import { addToCart, getCart } from "@/types/cart";
import { useEffect, useState } from "react";
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
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  function refreshCount() {
    setCartCount(
      getCart().reduce((sum, item) => sum + item.quantity, 0)
    );
  }

  useEffect(() => {
    refreshCount();

    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/products?page=${page}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("상품 목록 조회 실패");
        }

        return response.json();
      })
      .then((data: ProductPage) => {
        setProducts(data.content);
        setTotalPages(data.totalPages);
      })
      .catch((error) => {
        console.error("상품 조회 실패:", error);
      });
  }, [page]);

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
        <h1 className="mb-8 text-3xl font-light text-neutral-900">
          New{" "}
          <em className="not-italic font-semibold">
            Arrivals
          </em>
        </h1>

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

        {/* 상품이 없을 때 */}
        {products.length === 0 && (
          <div className="py-20 text-center text-sm text-neutral-400">
            판매 중인 상품이 없습니다.
          </div>
        )}

        {/* 페이징 */}
        {totalPages > 0 && (
          <div className="mt-10 flex justify-center gap-2">
            {Array.from(
              { length: totalPages },
              (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPage(index)}
                  className={
                    page === index
                      ? "border border-black bg-black px-4 py-2 text-white transition hover:scale-105"
                      : "border border-black bg-white px-4 py-2 text-black transition hover:scale-105 hover:bg-neutral-100"
                  }
                >
                  {index + 1}
                </button>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}