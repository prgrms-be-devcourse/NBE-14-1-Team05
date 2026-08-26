'use client';

import { CartProduct, getCart, saveCart } from "@/types/cart";
import { formatKRW } from "@/lib/format";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * 현재 시각이 오후 2시(14시) 이후인지 여부를 반환
 */
function isAfter14() {
  return new Date().getHours() >= 14;
}

type Step = "form" | "done";

/**
 * 결제 페이지: 배송 정보 입력, 유효성 검사, 결제 진행 및 완료 화면 처리
 */
export default function CheckoutPage() {

    const [items, setItems] = useState<CartProduct[]>([]);

    useEffect(() => {
    setItems(getCart());
    }, []);
    
    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

    const [step, setStep] = useState<Step>("form");
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: "", address: "", postcode: "" });
    const [errors, setErrors] = useState<Partial<typeof form>>({});

    /**
     * 입력 필드 값을 갱신하고 해당 필드의 에러 메시지를 초기화
     */
    function set(field: keyof typeof form, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    /**
     * 이메일/주소/우편번호 입력값을 검증하고 에러 메시지를 설정
     */
    function validate() {
        const e: Partial<typeof form> = {};
        if (!form.email.trim() || !form.email.includes("@")) e.email = "올바른 이메일을 입력해 주세요.";
        if (!form.address.trim()) e.address = "주소를 입력해 주세요.";
        if (!form.postcode.trim()) e.postcode = "우편번호를 입력해 주세요.";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    /**
     * 결제를 진행: 유효성 검사 통과 시 주문 생성 API를 호출하고, 성공하면 장바구니를 비우고 완료 단계로 전환
     */
    async function handlePay() {
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8080/api/v1/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: form.email,
                    address: form.address,
                    postcode: form.postcode,
                    orderItems: items.map((item) => ({
                        productId: item.id,
                        quantity: item.quantity,
                    })),
                }),
            });

            if (!res.ok) throw new Error("주문 생성에 실패했습니다.");

            saveCart([]);
            setStep("done");
        } catch (err) {
            console.error(err);
            alert("결제 처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
        } finally {
            setLoading(false);
        }
    }

    if (step === "done") {
        return (
        <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-[#F7F6F3] px-4">
            <div className="text-center max-w-sm w-full">
            <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center mx-auto mb-7">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
            <h2 className="text-4xl font-light text-neutral-900" style={{ fontFamily: "'Fraunces', serif" }}>
                결제되었습니다.
            </h2>
            <p className="text-neutral-400 text-sm mt-3 leading-relaxed">
                영수증을 <span className="text-neutral-600">{form.email}</span>로 발송했습니다.
            </p>
            <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-8 py-3 hover:bg-neutral-800 transition rounded-sm"
            >
            쇼핑 계속하기
            </Link>
            </div>
        </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-56px)] bg-[#F7F6F3] flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-sm rounded-sm overflow-hidden shadow-sm border border-neutral-200">

            {/* Summary — dark header */}
            <div className="bg-[#1a1a1a] px-6 pt-6 pb-7">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-white text-lg font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>
                Summary
                </h2>
                <Link
                href="/cart"
                className="text-neutral-500 hover:text-neutral-300 transition text-xs"
                >
                ← 장바구니
                </Link>
            </div>

            {items.length === 0 ? (
                <p className="text-neutral-500 text-sm">장바구니가 비어 있습니다.</p>
            ) : (
                <ul className="space-y-2.5">
                {items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3">
                    <span className="text-neutral-300 text-sm truncate">{item.name}</span>
                    <span className="shrink-0 bg-[#333] text-neutral-200 text-[11px] font-medium px-2 py-0.5 rounded">
                        {item.quantity}개
                    </span>
                    </li>
                ))}
                </ul>
            )}
            </div>

            {/* Form — light */}
            <div className="bg-white px-6 py-6 space-y-4">
            <Field label="이메일" error={errors.email}>
                <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder=""
                className={inputCls(errors.email)}
                />
            </Field>

            <Field label="주소" error={errors.address}>
                <input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder=""
                className={inputCls(errors.address)}
                />
            </Field>

            <Field label="우편번호" error={errors.postcode}>
                <input
                value={form.postcode}
                onChange={(e) => set("postcode", e.target.value.replace(/\D/g, "").slice(0, 5))}
                placeholder=""
                className={inputCls(errors.postcode) + " tabular-nums"}
                />
            </Field>

            {/* Delivery notice */}
            <p className="text-neutral-500 text-xs leading-relaxed pt-1">
                당일 오후 2시 이후의 주문은 다음날 배송을 시작합니다.
                {isAfter14() && (
                <span className="text-neutral-700 font-medium"> (현재 오후 2시 이후입니다.)</span>
                )}
            </p>

            {/* Total */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <span className="text-sm font-medium text-neutral-700">총금액</span>
                <span className="text-base font-semibold text-neutral-900 tabular-nums" style={{ fontFamily: "'Fraunces', serif" }}>
                {formatKRW(total)}
                </span>
            </div>

            {/* Pay button */}
            <button
                onClick={handlePay}
                disabled={loading || items.length === 0}
                className="w-full bg-[#1a1a1a] text-white py-3.5 text-sm font-semibold tracking-wide hover:bg-black active:bg-neutral-900 transition rounded-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
                {loading ? (
                <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    처리 중...
                </>
                ) : (
                "결제하기"
                )}
            </button>
            </div>
        </div>
        </div>
    );
    }

    /**
     * 에러 여부에 따라 입력 필드의 밑줄 색상을 다르게 적용한 클래스명을 반환
     */
    function inputCls(error?: string) {
    return `w-full border-b ${error ? "border-red-400" : "border-neutral-200"} bg-transparent py-2 text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-neutral-500 transition`;
    }

    /**
     * 라벨과 에러 메시지를 포함한 입력 필드 래퍼를 렌더링
     */
    function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
        <label className="block text-xs text-neutral-400 mb-1">{label}</label>
        {children}
        {error && <p className="text-red-400 text-[11px] mt-1">{error}</p>}
        </div>
    );
}
