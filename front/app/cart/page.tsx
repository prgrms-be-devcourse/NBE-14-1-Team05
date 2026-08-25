'use client';

import { CartProduct, getCart, removeFromCart, updateQuantity } from "@/types/cart";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function formatKRW(n: number) {
    return n.toLocaleString("ko-KR") + "원";
}

export default function CartPage() {
    const router = useRouter();
    const [items, setItems] = useState<CartProduct[]>([]);

    useEffect(() => {
        setItems(getCart());
    }, []);

    function handleQuantity(id: number, delta: number) {
        const next = items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
        );

        setItems(next);
        const item = next.find((i) => i.id === id);

        if (item) updateQuantity(id, item.quantity);
    }

    function handleRemove(id: number) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        removeFromCart(id);
    }

    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

    
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col lg:flex-row">
      {/* Left — dark summary */}
      <aside className="lg:w-[380px] bg-[#111110] text-white flex flex-col px-10 py-12 lg:sticky lg:top-14 lg:h-[calc(100vh-56px)]">
        <div className="mb-10">
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-neutral-400">
            주문 요약
          </span>
          <h1
            className="text-4xl font-light mt-2 leading-tight"
            
          >
            Your<br />
            <em className="not-italic font-semibold">Cart</em>
          </h1>
          <p className="text-neutral-400 text-sm mt-3">
            {items.length > 0
              ? `${items.length}종 · 총 ${items.reduce((s, i) => s + i.quantity, 0)}개`
              : "비어 있음"}
          </p>
        </div>

        <div className="flex-1 flex flex-col justify-end gap-5">
          <div className="border-t border-white/10 pt-5 flex justify-between items-baseline">
            <span className="text-xl font-light" >
              합계
            </span>
            <span className="text-3xl font-semibold" >
              {formatKRW(total)}
            </span>
          </div>

          <button
            disabled={items.length === 0}
            className="w-full bg-white text-black py-4 text-sm font-semibold tracking-[0.1em] uppercase hover:bg-neutral-100 active:bg-neutral-200 transition rounded-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            결제하기 →
          </button>

          <button
            onClick={() => router.push("/")}
            className="text-center text-xs text-neutral-500 hover:text-neutral-300 transition pb-2 underline underline-offset-2"
          >
            쇼핑 계속하기
          </button>
        </div>
      </aside>

      {/* Right — cart items */}
      <main className="flex-1 bg-[#F7F6F3] px-6 lg:px-12 py-12">
        <div className="max-w-2xl mx-auto">
          {items.length === 0 ? (
            <div className="text-center py-40">
              <p
                className="text-4xl text-neutral-300 font-light"
              >
                장바구니가 비어있습니다.
              </p>
              <p className="text-neutral-400 text-sm mt-3">상품을 담아볼까요?</p>
              <button
                onClick={() => router.push("/")}
                className="mt-8 inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-8 py-3 hover:bg-neutral-800 transition rounded-sm"
              >
                상품 보러 가기 →
              </button>
            </div>
          ) : (
            <div className="space-y-px">
              {items.map((item, i) => (
                <CartRow
                  key={item.id}
                  item={item}
                  isLast={i === items.length - 1}
                  onQtyChange={(d) => handleQuantity(item.id, d)}
                  onRemove={() => handleRemove(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function CartRow({
  item,
  isLast,
  onQtyChange,
  onRemove,
}: {
  item: CartProduct;
  isLast: boolean;
  onQtyChange: (d: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className={`flex gap-5 py-6 ${!isLast ? "border-b border-neutral-200" : ""} group`}>
      <div className="w-24 h-28 shrink-0 bg-neutral-100 rounded overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3
              className="text-lg font-light leading-tight text-neutral-900"
              
            >
              {item.name}
            </h3>
          </div>
          <p
            className="text-lg font-semibold text-neutral-900 shrink-0"
            
          >
            {(item.price * item.quantity).toLocaleString("ko-KR")}원
          </p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center border border-neutral-200 rounded-sm">
            <button
              onClick={() => onQtyChange(-1)}
              disabled={item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition text-lg leading-none disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
            <button
              onClick={() => onQtyChange(1)}
              className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition text-lg leading-none"
            >
              +
            </button>
          </div>
          <button
            onClick={onRemove}
            className="text-xs text-neutral-400 hover:text-red-500 transition underline underline-offset-2"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
