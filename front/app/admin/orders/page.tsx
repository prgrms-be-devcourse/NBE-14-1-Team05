"use client";

import { Fragment, useEffect, useState } from "react";

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

  // 커스텀 달력 드롭다운 상태
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarView, setCalendarView] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  const handlePrevMonth = () => {
    setCalendarView((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCalendarView((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const formatDateStr = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const firstDayOfWeek = new Date(
    calendarView.year,
    calendarView.month,
    1,
  ).getDay();
  const daysInMonth = new Date(
    calendarView.year,
    calendarView.month + 1,
    0,
  ).getDate();
  const todayStr = new Date().toISOString().split("T")[0];

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

  // 주문 상태 변경 (PUT /api/v1/admin/orders/{id}/status)
  const handleStatusChange = async (
    orderId: number,
    nextStatus: OrderStatus,
  ) => {
    const label = ORDER_STATUS_LABEL[nextStatus];
    if (
      !window.confirm(
        `주문 #${orderId}의 상태를 [${label}](으)로 변경하시겠습니까?`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${ORDERS_API}/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        throw new Error("상태 변경 실패");
      }

      const updatedOrder: Order = await response.json();

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updatedOrder : o)),
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder);
      }

      alert(`주문 상태가 [${label}](으)로 변경되었습니다.`);
    } catch (error) {
      console.error("상태 변경 실패:", error);
      alert("주문 상태 변경에 실패했습니다.");
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

  const cancelledCount = orders.filter(
    (order) => order.status === "CANCELLED",
  ).length;

  return (
    <div className="min-h-[85vh] space-y-7">
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
          {/* 📅 캘린더 드롭다운 */}
          <div className="relative flex items-center gap-2 border-l border-neutral-200 pl-2">
            <span className="text-xs font-medium text-neutral-500">
              배송일:
            </span>
            <button
              type="button"
              onClick={() => setIsCalendarOpen((prev) => !prev)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                filterMode === "DATE"
                  ? "border-[#A77A52] bg-[#FAF7F3] font-semibold text-[#8A684A]"
                  : "border-neutral-200 bg-[#FAFAF9] text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <span>{selectedDate}</span>
              <span className="text-neutral-400"></span>
            </button>

            {isCalendarOpen && (
              <>
                {/* 팝업 외부 클릭 시 닫히는 투명 오버레이 */}
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsCalendarOpen(false)}
                />

                {/* 캘린더 팝업 카드 */}
                <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
                  {/* 월 이동 헤더 */}
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="cursor-pointer rounded-lg p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                    >
                      ◀
                    </button>
                    <span className="text-xs font-bold text-neutral-800">
                      {calendarView.year}년 {calendarView.month + 1}월
                    </span>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="cursor-pointer rounded-lg p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                    >
                      ▶
                    </button>
                  </div>

                  {/* 요일 헤더 */}
                  <div className="mt-2.5 grid grid-cols-7 text-center text-[11px] font-semibold text-neutral-400">
                    <span className="text-red-500">일</span>
                    <span>월</span>
                    <span>화</span>
                    <span>수</span>
                    <span>목</span>
                    <span>금</span>
                    <span className="text-blue-500">토</span>
                  </div>

                  {/* 날짜 그리드 */}
                  <div className="mt-1.5 grid grid-cols-7 gap-1 text-center text-xs">
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = formatDateStr(
                        calendarView.year,
                        calendarView.month,
                        day,
                      );
                      const isSelected =
                        selectedDate === dateStr && filterMode === "DATE";
                      const isToday = todayStr === dateStr;

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            setSelectedDate(dateStr);
                            setFilterMode("DATE");
                            setIsCalendarOpen(false);
                          }}
                          className={`flex h-7 w-7 mx-auto cursor-pointer items-center justify-center rounded-lg text-xs transition ${
                            isSelected
                              ? "bg-[#A77A52] font-bold text-white shadow-sm"
                              : isToday
                                ? "border border-[#A77A52] font-semibold text-[#8A684A] hover:bg-[#FAF7F3]"
                                : "text-neutral-700 hover:bg-neutral-100"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>

                  {/* 하단 오늘 바로가기 & 닫기 */}
                  <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        setCalendarView({
                          year: d.getFullYear(),
                          month: d.getMonth(),
                        });
                        setSelectedDate(todayStr);
                        setFilterMode("DATE");
                        setIsCalendarOpen(false);
                      }}
                      className="cursor-pointer text-[11px] font-medium text-[#8A684A] hover:underline"
                    >
                      오늘 ({todayStr})
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCalendarOpen(false)}
                      className="cursor-pointer text-[11px] text-neutral-400 hover:text-neutral-600"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 주문 현황 */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

        {/* 주문 취소 */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">주문 취소</p>

              <p className="mt-3 text-2xl font-bold text-neutral-900">
                {cancelledCount}

                <span className="ml-1 text-sm font-medium text-neutral-400">
                  건
                </span>
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              ✕
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

      {/* 주문 목록 (아코디언 상세 보기 지원) */}
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
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-[#FAFAF9] text-left text-xs font-semibold text-neutral-500">
                <th className="w-14 px-3 py-4 text-center">번호</th>

                <th className="px-6 py-4">주문자</th>

                <th className="w-44 px-4 py-4">주문일시</th>

                <th className="w-28 px-3 py-4 text-center">상태</th>

                <th className="w-36 px-4 py-4 text-right">결제금액</th>

                <th className="w-28 px-3 py-4 text-center">상태 변경</th>

                <th className="w-24 px-3 py-4 text-center">상세</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order, index) => (
                <Fragment key={order.id}>
                  <tr
                    className={`border-t border-neutral-100 transition ${
                      selectedOrder?.id === order.id
                        ? "bg-[#FAF7F3] font-medium"
                        : "hover:bg-[#FCFBF9]"
                    }`}
                  >
                    <td className="px-3 py-5 text-center text-sm text-neutral-400">
                      {index + 1}
                    </td>

                    <td className="px-6 py-5 truncate">
                      <div>
                        <p
                          className="truncate text-sm font-semibold text-neutral-900"
                          title={order.email}
                        >
                          {order.email}
                        </p>

                        <p className="mt-1 text-xs text-neutral-400">
                          주문 #{order.id}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-5 text-sm text-neutral-500 whitespace-nowrap">
                      {formatDateTime(order.orderDate)}
                    </td>

                    <td className="px-3 py-5 text-center whitespace-nowrap">
                      <span className={statusBadge(order.status)}>
                        {statusLabel(order.status)}
                      </span>
                    </td>

                    <td className="px-4 py-5 text-right text-sm font-semibold text-neutral-800 whitespace-nowrap">
                      {order.totalPrice.toLocaleString("ko-KR")}원
                    </td>

                    {/* 원클릭 상태 변경 액션 버튼 */}
                    <td className="px-3 py-5 text-center whitespace-nowrap">
                      {order.status === "ORDERED" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(order.id, "SHIPPED")
                          }
                          className="cursor-pointer rounded-lg bg-[#A77A52] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#8A684A]"
                        >
                          배송 시작
                        </button>
                      )}
                      {order.status === "SHIPPED" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(order.id, "DELIVERED")
                          }
                          className="cursor-pointer rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                        >
                          배송 완료
                        </button>
                      )}
                      {order.status === "DELIVERED" && (
                        <span className="text-xs font-medium text-neutral-400">
                          완료
                        </span>
                      )}
                      {order.status === "CANCELLED" && (
                        <span className="text-xs font-medium text-red-500">
                          취소
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedOrder?.id === order.id) {
                            setSelectedOrder(null);
                          } else {
                            handleSelectOrder(order.id);
                          }
                        }}
                        className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                          selectedOrder?.id === order.id
                            ? "border-[#A77A52] bg-[#A77A52] text-white"
                            : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                        }`}
                      >
                        {selectedOrder?.id === order.id ? "닫기" : "상세보기"}
                      </button>
                    </td>
                  </tr>

                  {/* 🚀 누른 버튼 바로 아래에 펼쳐지는 상세 정보 아코디언 행 */}
                  {selectedOrder?.id === order.id && (
                    <tr className="border-t border-b border-neutral-200 bg-[#FAF9F7]">
                      <td colSpan={7} className="p-8">
                        {detailLoading ? (
                          <div className="py-8 text-center text-sm text-neutral-400">
                            주문 상세를 불러오는 중입니다.
                          </div>
                        ) : detailError ? (
                          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                            {detailError}
                          </div>
                        ) : (
                          <div className="space-y-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                              <div>
                                <p className="text-xs font-medium text-[#9A7655]">
                                  ORDER DETAIL
                                </p>
                                <h2 className="mt-1 text-lg font-semibold text-neutral-900">
                                  주문 상세 (#{selectedOrder.id})
                                </h2>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(null)}
                                className="cursor-pointer rounded-lg px-3 py-2 text-sm text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                              >
                                닫기 ×
                              </button>
                            </div>

                            {/* 주문 정보 */}
                            <div>
                              <h3 className="mb-4 text-sm font-semibold text-neutral-900">
                                주문 정보
                              </h3>

                              <div className="grid grid-cols-1 gap-4 rounded-xl bg-[#FAFAF9] p-5 md:grid-cols-4">
                                <div>
                                  <p className="text-xs text-neutral-400">
                                    주문번호
                                  </p>
                                  <p className="mt-2 text-sm font-semibold text-neutral-900">
                                    #{selectedOrder.id}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-neutral-400">
                                    주문 상태
                                  </p>
                                  <div className="mt-2">
                                    <span
                                      className={statusBadge(
                                        selectedOrder.status,
                                      )}
                                    >
                                      {statusLabel(selectedOrder.status)}
                                    </span>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-xs text-neutral-400">
                                    주문일시
                                  </p>
                                  <p className="mt-2 text-sm font-medium text-neutral-700">
                                    {formatDateTime(selectedOrder.orderDate)}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-neutral-400">
                                    결제금액
                                  </p>
                                  <p className="mt-2 text-sm font-bold text-neutral-900">
                                    {selectedOrder.totalPrice.toLocaleString(
                                      "ko-KR",
                                    )}
                                    원
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
                                  <p className="text-xs text-neutral-400">
                                    이메일
                                  </p>
                                  <p className="mt-1.5 text-sm font-medium text-neutral-700">
                                    {selectedOrder.email}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-neutral-400">
                                    우편번호
                                  </p>
                                  <p className="mt-1.5 text-sm font-medium text-neutral-700">
                                    {selectedOrder.postcode}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-neutral-400">
                                    주소
                                  </p>
                                  <p className="mt-1.5 text-sm font-medium text-neutral-700">
                                    {selectedOrder.address}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-neutral-400">
                                    배송일
                                  </p>
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
                                    {(selectedOrder.orderItems ?? []).map(
                                      (item) => (
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
                                      ),
                                    )}

                                    {(!selectedOrder.orderItems ||
                                      selectedOrder.orderItems.length ===
                                        0) && (
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
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}

              {orders.length === 0 && !error && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
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
    </div>
  );
}
