"use client";

import { useEffect, useState } from "react";

import {
  ORDER_STATUS_LABEL,
  type Order,
  type OrderStatus,
} from "@/types/order";

const ORDERS_API = "http://localhost:8080/api/v1/admin/orders";

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ko-KR");
}

function statusLabel(status: OrderStatus) {
  return ORDER_STATUS_LABEL[status] ?? status;
}

// 주문 상태별 배지 스타일
function statusBadge(status: OrderStatus) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  // 필터 상태 ("ALL": 전체, "TODAY": 오늘 배송, "DATE": 날짜 선택)
  const [filterMode, setFilterMode] = useState<"ALL" | "TODAY" | "DATE">("ALL");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);

  // 날짜별/전체 주문 목록 조회
  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      let url = ORDERS_API;
      if (filterMode === "TODAY") {
        url = `${ORDERS_API}/today-deliveries`;
      } else if (filterMode === "DATE") {
        url = `${ORDERS_API}/today-deliveries?date=${selectedDate}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("주문 목록을 불러오지 못했습니다.");
      }
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("주문 조회 실패:", error);
      setError("주문 목록을 불러오지 못했습니다.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchOrders();
  }, [filterMode, selectedDate]);

  // 주문 상세 조회
  const handleSelectOrder = async (id: number) => {
    setDetailError("");
    setDetailLoading(true);

    try {
      const response = await fetch(`${ORDERS_API}/${id}`);

      if (!response.ok) {
        throw new Error("주문 상세를 불러오지 못했습니다.");
      }

      const data: Order = await response.json();

      setSelectedOrder(data);
    } catch (error) {
      console.error("주문 상세 조회 실패:", error);

      setDetailError("주문 상세를 불러오지 못했습니다.");
      setSelectedOrder(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // 상태별 주문 개수
  const orderedCount = orders.filter(
    (order) => order.status === "ORDERED",
  ).length;

  const shippedCount = orders.filter(
    (order) => order.status === "SHIPPED",
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "DELIVERED",
  ).length;

  return (
    <div className="space-y-7">
      {/* 페이지 상단 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-[#9A7655]">ORDERS</p>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            주문 관리
          </h1>
        </div>
        {/* 📅 날짜별 필터 바 */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm">
          <button
            type="button"
            onClick={() => setFilterMode("ALL")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              filterMode === "ALL"
                ? "bg-[#1D1916] text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            전체 주문
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("TODAY")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              filterMode === "TODAY"
                ? "bg-[#A77A52] text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            오늘 배송 대상
          </button>
          <div className="flex items-center gap-2 border-l border-neutral-200 pl-2">
            <span className="text-xs font-medium text-neutral-500">
              배송일:
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setFilterMode("DATE");
              }}
              className="rounded-lg border border-neutral-200 bg-[#FAFAF9] px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 주문 현황 */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* 전체 주문 */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">전체 주문</p>

              <p className="mt-3 text-2xl font-bold text-neutral-900">
                {orders.length}

                <span className="ml-1 text-sm font-medium text-neutral-400">
                  건
                </span>
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
              ▤
            </div>
          </div>
        </div>

        {/* 주문 완료 */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">주문 완료</p>

              <p className="mt-3 text-2xl font-bold text-neutral-900">
                {orderedCount}

                <span className="ml-1 text-sm font-medium text-neutral-400">
                  건
                </span>
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5EEE7] text-[#8A684A]">
              ✓
            </div>
          </div>
        </div>

        {/* 배송 중 */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">배송 중</p>

              <p className="mt-3 text-2xl font-bold text-neutral-900">
                {shippedCount}

                <span className="ml-1 text-sm font-medium text-neutral-400">
                  건
                </span>
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              →
            </div>
          </div>
        </div>

        {/* 배송 완료 */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">배송 완료</p>

              <p className="mt-3 text-2xl font-bold text-neutral-900">
                {deliveredCount}

                <span className="ml-1 text-sm font-medium text-neutral-400">
                  건
                </span>
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              ✓
            </div>
          </div>
        </div>
      </section>

      {/* 에러 메시지 */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* 주문 목록 */}
      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
          <div>
            <h2 className="font-semibold text-neutral-900">주문 목록</h2>

            <p className="mt-1 text-sm text-neutral-400">
              총 {orders.length}건의 주문
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FAFAF9] text-left text-xs font-semibold text-neutral-500">
                <th className="w-20 px-6 py-4">번호</th>

                <th className="px-6 py-4">주문자</th>

                <th className="px-6 py-4">주문일시</th>

                <th className="w-32 px-6 py-4">상태</th>

                <th className="w-40 px-6 py-4">결제금액</th>

                <th className="w-28 px-6 py-4 text-center">관리</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order, index) => (
                <tr
                  key={order.id}
                  className={`border-t border-neutral-100 transition ${
                    selectedOrder?.id === order.id
                      ? "bg-[#FAF7F3]"
                      : "hover:bg-[#FCFBF9]"
                  }`}
                >
                  <td className="px-6 py-5 text-sm text-neutral-400">
                    {index + 1}
                  </td>

                  <td className="px-6 py-5">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {order.email}
                      </p>

                      <p className="mt-1 text-xs text-neutral-400">
                        주문 #{order.id}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-sm text-neutral-500">
                    {formatDateTime(order.orderDate)}
                  </td>

                  <td className="px-6 py-5">
                    <span className={statusBadge(order.status)}>
                      {statusLabel(order.status)}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-sm font-semibold text-neutral-800">
                    {order.totalPrice.toLocaleString("ko-KR")}원
                  </td>

                  <td className="px-6 py-5 text-center">
                    <button
                      type="button"
                      onClick={() => handleSelectOrder(order.id)}
                      className="cursor-pointer rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                    >
                      상세보기
                    </button>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && !error && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-300">
                      ▤
                    </div>

                    <p className="mt-4 text-sm font-medium text-neutral-500">
                      접수된 주문이 없습니다.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 주문 상세 */}
      {(detailLoading || detailError || selectedOrder) && (
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {/* 상세 상단 */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
            <div>
              <p className="text-xs font-medium text-[#9A7655]">ORDER DETAIL</p>

              <h2 className="mt-1 text-lg font-semibold text-neutral-900">
                주문 상세
              </h2>
            </div>

            {selectedOrder && (
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
              >
                닫기 ×
              </button>
            )}
          </div>

          {/* 상세 로딩 */}
          {detailLoading && (
            <div className="px-6 py-12 text-center text-sm text-neutral-400">
              주문 상세를 불러오는 중입니다.
            </div>
          )}

          {/* 상세 에러 */}
          {detailError && (
            <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {detailError}
            </div>
          )}

          {!detailLoading && selectedOrder && (
            <div className="space-y-8 p-6">
              {/* 주문 정보 */}
              <div>
                <h3 className="mb-4 text-sm font-semibold text-neutral-900">
                  주문 정보
                </h3>

                <div className="grid grid-cols-1 gap-4 rounded-xl bg-[#FAFAF9] p-5 md:grid-cols-4">
                  <div>
                    <p className="text-xs text-neutral-400">주문번호</p>

                    <p className="mt-2 text-sm font-semibold text-neutral-900">
                      #{selectedOrder.id}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-400">주문 상태</p>

                    <div className="mt-2">
                      <span className={statusBadge(selectedOrder.status)}>
                        {statusLabel(selectedOrder.status)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-400">주문일시</p>

                    <p className="mt-2 text-sm font-medium text-neutral-700">
                      {formatDateTime(selectedOrder.orderDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-400">결제금액</p>

                    <p className="mt-2 text-sm font-bold text-neutral-900">
                      {selectedOrder.totalPrice.toLocaleString("ko-KR")}원
                    </p>
                  </div>
                </div>
              </div>

              {/* 배송 정보 */}
              <div>
                <h3 className="mb-4 text-sm font-semibold text-neutral-900">
                  배송 정보
                </h3>

                <div className="grid grid-cols-1 gap-x-10 gap-y-5 rounded-xl border border-neutral-100 p-5 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-neutral-400">이메일</p>

                    <p className="mt-1.5 text-sm font-medium text-neutral-700">
                      {selectedOrder.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-400">우편번호</p>

                    <p className="mt-1.5 text-sm font-medium text-neutral-700">
                      {selectedOrder.postcode}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-400">주소</p>

                    <p className="mt-1.5 text-sm font-medium text-neutral-700">
                      {selectedOrder.address}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-neutral-400">배송일</p>

                    <p className="mt-1.5 text-sm font-medium text-neutral-700">
                      {formatDateTime(selectedOrder.deliveryDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* 주문 상품 */}
              <div>
                <h3 className="mb-4 text-sm font-semibold text-neutral-900">
                  주문 상품
                </h3>

                <div className="overflow-hidden rounded-xl border border-neutral-100">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#FAFAF9] text-left text-xs font-semibold text-neutral-500">
                        <th className="px-5 py-4">상품명</th>

                        <th className="px-5 py-4">상품 ID</th>

                        <th className="px-5 py-4">수량</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedOrder.orderItems.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t border-neutral-100"
                        >
                          <td className="px-5 py-4 text-sm font-medium text-neutral-900">
                            {item.productName}
                          </td>

                          <td className="px-5 py-4 text-sm text-neutral-500">
                            {item.productId ?? "-"}
                          </td>

                          <td className="px-5 py-4 text-sm text-neutral-700">
                            {item.quantity}개
                          </td>
                        </tr>
                      ))}

                      {selectedOrder.orderItems.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-5 py-10 text-center text-sm text-neutral-400"
                          >
                            주문 상품이 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
