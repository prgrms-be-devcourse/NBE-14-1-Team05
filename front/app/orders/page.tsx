"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ORDER_STATUS_LABEL,
    type Order,
    type OrderStatus,
} from "@/types/order";

const ORDERS_API = "http://localhost:8080/api/v1/orders";
const VERIFICATION_API = "http://localhost:8080/api/v1/verification";

function formatDateTime(value: string | null) {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString("ko-KR");
}

function statusBadge(status: OrderStatus) {
    const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";
    switch (status) {
        case "ORDERED":
            return `${base} bg-[#F5EEE7] text-[#8A684A]`;
        case "SHIPPED":
            return `${base} bg-blue-50 text-blue-600`;
        case "DELIVERED":
            return `${base} bg-emerald-50 text-emerald-600`;
        case "CANCELLED":
            return `${base} bg-red-50 text-red-600`;
        default:
            return `${base} bg-neutral-100 text-neutral-600`;
    }
}

// 상태별 안내 문구 분기 (CANCELLED는 문구 미노출)
function getOrderActionMessage(status: OrderStatus) {
    switch (status) {
        case "DELIVERED":
            return "배송이 완료되었습니다.";
        case "SHIPPED":
            return "배송 중인 상품은 수정/취소가 불가합니다.";
        default:
            return null;
    }
}

export default function CustomerOrdersPage() {
    // 인증 단계: email(이메일 입력 → 인증번호 발송) → code(인증번호 입력 → 검증)
    const [step, setStep] = useState<"email" | "code">("email");
    const [emailInput, setEmailInput] = useState("");
    const [codeInput, setCodeInput] = useState("");
    const [verifiedEmail, setVerifiedEmail] = useState("");

    const [sendingCode, setSendingCode] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

    // 배송지 수정 모달 상태
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [editAddress, setEditAddress] = useState("");
    const [editPostcode, setEditPostcode] = useState("");

    // 인증번호 발송 (POST /api/v1/verification/send)
    const handleSendCode = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        const email = emailInput.trim();
        if (!email) {
            alert("이메일을 입력해주세요.");
            return;
        }

        setSendingCode(true);
        setError("");

        try {
            const response = await fetch(`${VERIFICATION_API}/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email }),
            });
            if (!response.ok) {
                throw new Error("인증번호 전송에 실패했습니다.");
            }
            setCodeInput("");
            setStep("code");
        } catch (err) {
            console.error(err);
            setError("인증번호 전송 중 오류가 발생했습니다. 이메일 주소를 확인해주세요.");
        } finally {
            setSendingCode(false);
        }
    };

    // 인증번호 검증 (POST /api/v1/verification/verify) → 성공 시 세션에 이메일 저장
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        const email = emailInput.trim();
        const code = codeInput.trim();
        if (!code) {
            alert("인증번호를 입력해주세요.");
            return;
        }

        setVerifying(true);
        setError("");

        try {
            const response = await fetch(`${VERIFICATION_API}/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, code }),
            });
            if (!response.ok) {
                throw new Error("인증번호 검증에 실패했습니다.");
            }
            setVerifiedEmail(email);
            await fetchOrders();
        } catch (err) {
            console.error(err);
            setError("인증번호가 일치하지 않거나 만료되었습니다. 다시 시도해주세요.");
        } finally {
            setVerifying(false);
        }
    };

    // 인증 정보 초기화 후 이메일 입력 단계로 복귀
    const resetVerification = () => {
        setStep("email");
        setCodeInput("");
        setVerifiedEmail("");
        setOrders([]);
        setHasSearched(false);
        setError("");
    };

    // 세션 이메일 기반 주문 조회 (GET /api/v1/orders)
    const fetchOrders = async () => {
        setLoading(true);
        setError("");
        setHasSearched(true);

        try {
            const response = await fetch(ORDERS_API, {
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("주문 내역을 불러오지 못했습니다.");
            }
            const data: Order[] = await response.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("주문 내역을 불러오는 중 오류가 발생했습니다.");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const refreshOrders = async () => {
        if (!verifiedEmail) return;
        try {
            const response = await fetch(ORDERS_API, {
                credentials: "include",
            });
            if (response.ok) {
                const data: Order[] = await response.json();
                setOrders(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // 주문 취소 (DELETE /api/v1/orders/{id})
    const handleCancel = async (id: number) => {
        if (!window.confirm("주문을 취소하시겠습니까?")) return;

        try {
            const response = await fetch(`${ORDERS_API}/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("주문 취소에 실패했습니다.");
            }

            alert("주문이 정상적으로 취소되었습니다.");
            await refreshOrders();
        } catch (err) {
            console.error(err);
            alert("주문 취소 처리 중 오류가 발생했습니다. (배송 준비 중인 주문은 취소할 수 없습니다.)");
        }
    };

    // 배송지 수정 모달 열기
    const openEditModal = (order: Order) => {
        setEditingOrder(order);
        setEditAddress(order.address);
        setEditPostcode(order.postcode);
        setIsEditModalOpen(true);
    };

    // 우편번호 숫자만 5자리 제한 핸들러
    const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numericOnly = e.target.value.replace(/\D/g, "").slice(0, 5);
        setEditPostcode(numericOnly);
    };

    // 배송지 수정 제출 (PATCH /api/v1/orders/{id})
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOrder) return;

        if (editPostcode.length !== 5) {
            alert("우편번호 5자리를 정확히 입력해주세요.");
            return;
        }

        try {
            const response = await fetch(`${ORDERS_API}/${editingOrder.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    address: editAddress,
                    postcode: editPostcode,
                }),
            });

            if (!response.ok) {
                throw new Error("배송지 수정에 실패했습니다.");
            }

            alert("배송지 정보가 수정되었습니다.");
            setIsEditModalOpen(false);
            await refreshOrders();
        } catch (err) {
            console.error(err);
            alert("배송지 수정 처리 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
            {/* 상품 목록 바로가기 네비게이션 */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <Link
                    href="/products"
                    className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition flex items-center gap-1"
                >
                    ← 상품 목록으로 돌아가기
                </Link>
            </div>

            {/* 상단 타이틀 */}
            <div className="text-center space-y-2">
                <p className="text-xs font-semibold tracking-widest text-[#9A7655]">ORDER LOOKUP</p>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">주문 내역 조회</h1>
                <p className="text-sm text-neutral-500">
                    주문 시 입력하셨던 이메일로 인증번호를 받아 본인 확인 후 주문 내역을 확인 및 수정/취소하실 수 있습니다.
                </p>
            </div>

            {/* 이메일 인증 영역 */}
            {!verifiedEmail && (
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    {step === "email" ? (
                        <form onSubmit={handleSendCode} className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                placeholder="주문 시 사용한 이메일을 입력하세요 (예: user@example.com)"
                                className="flex-1 rounded-xl border border-neutral-200 bg-[#FAFAF9] px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#A77A52] focus:bg-white focus:ring-2 focus:ring-[#A77A52]/10"
                                required
                            />
                            <button
                                type="submit"
                                disabled={sendingCode}
                                className="cursor-pointer rounded-xl bg-[#1F1B18] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#342D28] disabled:opacity-50"
                            >
                                {sendingCode ? "전송 중..." : "인증번호 받기"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyCode} className="space-y-3">
                            <p className="text-xs text-neutral-500">
                                <span className="font-semibold text-[#8A684A]">{emailInput.trim()}</span> 으로 인증번호를 전송했습니다.
                                메일함을 확인해 인증번호를 입력해주세요. (유효시간 5분)
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    value={codeInput}
                                    onChange={(e) => setCodeInput(e.target.value)}
                                    placeholder="인증번호 6자리"
                                    className="flex-1 rounded-xl border border-neutral-200 bg-[#FAFAF9] px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#A77A52] focus:bg-white focus:ring-2 focus:ring-[#A77A52]/10"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={verifying}
                                    className="cursor-pointer rounded-xl bg-[#1F1B18] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#342D28] disabled:opacity-50"
                                >
                                    {verifying ? "확인 중..." : "인증 확인"}
                                </button>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <button
                                    type="button"
                                    onClick={handleSendCode}
                                    disabled={sendingCode}
                                    className="cursor-pointer font-semibold text-[#8A684A] hover:underline disabled:opacity-50"
                                >
                                    인증번호 재전송
                                </button>
                                <button
                                    type="button"
                                    onClick={resetVerification}
                                    className="cursor-pointer text-neutral-400 hover:text-neutral-600"
                                >
                                    이메일 다시 입력
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* 에러 메시지 */}
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 text-center">
                    {error}
                </div>
            )}

            {/* 조회 결과 영역 */}
            {verifiedEmail && hasSearched && !loading && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                        <h2 className="text-sm font-semibold text-neutral-800">
                            <span className="font-bold text-[#8A684A]">{verifiedEmail}</span> 님의 주문 내역
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-neutral-500">총 {orders.length}건</span>
                            <button
                                type="button"
                                onClick={resetVerification}
                                className="cursor-pointer text-xs font-semibold text-neutral-400 hover:text-neutral-600"
                            >
                                다른 이메일로 조회
                            </button>
                        </div>
                    </div>

                    {orders.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-center">
                            <p className="text-sm font-medium text-neutral-500">조회된 주문 내역이 없습니다.</p>
                            <p className="mt-1 text-xs text-neutral-400">입력하신 이메일 주소를 다시 확인해주세요.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-5"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                                        <div>
                                            <span className="text-xs font-semibold text-neutral-400">주문번호</span>
                                            <p className="text-base font-bold text-neutral-900">#{order.id}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-neutral-400">{formatDateTime(order.orderDate)}</span>
                                            <span className={statusBadge(order.status)}>
                                                {ORDER_STATUS_LABEL[order.status] ?? order.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl bg-[#FAFAF9] p-4 text-xs">
                                        <div>
                                            <span className="text-neutral-400">배송지 주소:</span>
                                            <p className="mt-1 font-medium text-neutral-800">
                                                ({order.postcode}) {order.address}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-neutral-400">배송 예정일:</span>
                                            <p className="mt-1 font-medium text-neutral-800">
                                                {formatDateTime(order.deliveryDate)}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-xs font-semibold text-neutral-700">주문 상품</span>
                                        <div className="mt-2 divide-y divide-neutral-100">
                                            {(order.orderItems ?? []).map((item) => (
                                                <div key={item.id} className="flex justify-between py-2 text-xs">
                                                    <span className="text-neutral-800 font-medium">{item.productName}</span>
                                                    <span className="text-neutral-500">{item.quantity}개</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 총 결제금액 및 조건부 버튼/문구 (2번 반영) */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4">
                                        <div className="text-sm">
                                            <span className="text-neutral-500">총 결제금액: </span>
                                            <span className="font-bold text-neutral-900">
                                                {order.totalPrice.toLocaleString("ko-KR")}원
                                            </span>
                                        </div>

                                        {order.status === "ORDERED" ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(order)}
                                                    className="cursor-pointer rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
                                                >
                                                    배송지 수정
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCancel(order.id)}
                                                    className="cursor-pointer rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-100"
                                                >
                                                    주문 취소
                                                </button>
                                            </div>
                                        ) : (
                                            getOrderActionMessage(order.status) && (
                                                <span className="text-xs font-medium text-neutral-400">
                                                    {getOrderActionMessage(order.status)}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 배송지 수정 모달 */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
                        <div className="border-b border-neutral-100 px-6 py-5">
                            <h3 className="font-semibold text-neutral-900">배송지 정보 수정</h3>
                            <p className="mt-1 text-xs text-neutral-400">주문 접수(ORDERED) 상태에서만 수정 가능합니다.</p>
                        </div>

                        <form onSubmit={handleEditSubmit}>
                            <div className="space-y-4 p-6">
                                <div>
                                    <label htmlFor="postcode" className="mb-1.5 block text-xs font-semibold text-neutral-700">
                                        우편번호 (5자리 숫자) <span className="text-[#A77A52]">*</span>
                                    </label>
                                    <input
                                        id="postcode"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={5}
                                        value={editPostcode}
                                        onChange={handlePostcodeChange}
                                        placeholder="12345"
                                        className="w-full rounded-xl border border-neutral-200 bg-[#FAFAF9] px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#A77A52] focus:bg-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="address" className="mb-1.5 block text-xs font-semibold text-neutral-700">
                                        배송지 주소 <span className="text-[#A77A52]">*</span>
                                    </label>
                                    <input
                                        id="address"
                                        type="text"
                                        value={editAddress}
                                        onChange={(e) => setEditAddress(e.target.value)}
                                        placeholder="상세 주소를 입력하세요"
                                        className="w-full rounded-xl border border-neutral-200 bg-[#FAFAF9] px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#A77A52] focus:bg-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-neutral-100 bg-[#FAFAF9] px-6 py-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="cursor-pointer rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="cursor-pointer rounded-xl bg-[#1F1B18] px-4 py-2 text-xs font-semibold text-white hover:bg-[#342D28]"
                                >
                                    수정 완료
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
