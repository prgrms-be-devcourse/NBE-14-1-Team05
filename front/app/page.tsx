'use client';

import Link from "next/link";
import { addToCart, getCart } from "@/types/cart";
import { formatKRW } from "@/lib/format";
import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
};

const PRODUCTS: Product[] = [
  { id: 1, name: "커피 1", price: 29000, image: "https://placehold.co/400x480/EDEDED/171717?text=1" },
  { id: 2, name: "커피 2", price: 59000, image: "https://placehold.co/400x480/E5E1D8/171717?text=2" },
  { id: 3, name: "커피 3", price: 89000, image: "https://placehold.co/400x480/D9D4C7/171717?text=3" },
  { id: 4, name: "커피 4", price: 129000, image: "https://placehold.co/400x480/CFC9B8/171717?text=4" },
  { id: 5, name: "커피 5", price: 79000, image: "https://placehold.co/400x480/E8E2D6/171717?text=5" },
  { id: 6, name: "커피 6", price: 49000, image: "https://placehold.co/400x480/EFEBE2/171717?text=6" },
];

export default function Home() {
  const [cartCount, setCartCount] = useState(0);

  function refreshCount() {
    setCartCount(getCart().reduce((s, i) => s + i.quantity, 0));
  }

  useEffect(() => {
    refreshCount();
  }, []);

  function handleAdd(product: Product) {
    addToCart(product);
    refreshCount();
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <header className="sticky top-0 z-10 bg-[#F7F6F3]/90 backdrop-blur border-b border-neutral-200 px-6 lg:px-12 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight">SHOP</span>
        <Link
          href="/cart"
          className="flex items-center gap-2 text-sm text-neutral-700 hover:text-black transition"
        >
          장바구니
          {cartCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-black text-white text-xs tabular-nums">
              {cartCount}
            </span>
          )}
        </Link>
      </header>

      <main className="px-6 lg:px-12 py-12 max-w-6xl mx-auto">
        <h1 className="text-3xl font-light mb-8">
          New <em className="not-italic font-semibold">Arrivals</em>
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="group">
              <div className="aspect-[4/5] bg-neutral-100 rounded overflow-hidden mb-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <h3 className="text-sm font-light text-neutral-900">{product.name}</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-semibold text-neutral-900">
                  {formatKRW(product.price)}
                </span>
                <button
                  onClick={() => handleAdd(product)}
                  className="text-xs px-3 py-1.5 border border-neutral-300 rounded-sm hover:bg-black hover:text-white hover:border-black transition"
                >
                  담기
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
