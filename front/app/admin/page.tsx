"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ORDER_STATUS_LABEL,
  type Order,
  type OrderStatus,
} from "@/types/order";

interface TopProduct {
  productName: string;
  quantity: number;
  revenue: number;
}

interface DailySales {
  date: string;
  orderCount: number;
  revenue: number;
}

interface MonthlySales {
  yearMonth: string;
  orderCount: number;
  revenue: number;
}

interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  todayDeliveries: number;
  topQuantityProducts: TopProduct[];
  topRevenueProducts: TopProduct[];
  dailySales: DailySales[];
  monthlySales: MonthlySales[];
}

function statusLabel(status: OrderStatus) {
  return ORDER_STATUS_LABEL[status] ?? status;
}

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

export default function AdminPage() {
  const [productCount, setProductCount] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [salesTab, setSalesTab] = useState<"ALL" | "TODAY" | "DAILY" | "MONTHLY" | "CUSTOM">("ALL");
  const [loading, setLoading] = useState(true);

  // 캘린더 날짜 선택 및 해당 일자 주문 상태
  const [selectedSalesDate, setSelectedSalesDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarView, setCalendarView] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });
  const [customOrders, setCustomOrders] = useState<Order[]>([]);
  const [customLoading, setCustomLoading] = useState(false);

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

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 등록 상품 수 조회
        const productResponse = await fetch("/api/admin/products");
        if (productResponse.ok) {
          const products = await productResponse.json();
          setProductCount(products.totalElements ?? 0);
        }

        // 최근 주문 목록 조회 (페이징 객체 대응)
        const orderResponse = await fetch(
          "http://localhost:8080/api/v1/admin/orders?page=0&size=5",
        );
        if (orderResponse.ok) {
          const orderData = await orderResponse.json();
          const orderList =
            orderData.content ?? (Array.isArray(orderData) ? orderData : []);
          setOrders(orderList);
        }

        // 관리자 통계 지표 종합 조회
        const statsResponse = await fetch(
          "http://localhost:8080/api/v1/admin/stats",
        );
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error("대시보드 데이터 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // 선택한 특정 날짜의 매출 및 주문 데이터 조회
  const fetchCustomDateSales = async (date: string) => {
    setCustomLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/admin/orders?startDate=${date}&endDate=${date}&size=100`,
      );
      if (response.ok) {
        const data = await response.json();
        const list = data.content ?? (Array.isArray(data) ? data : []);
        setCustomOrders(list);
      }
    } catch (err) {
      console.error("선택 일자 매출 조회 실패:", err);
      setCustomOrders([]);
    } finally {
      setCustomLoading(false);
    }
  };

  useEffect(() => {
    if (salesTab === "CUSTOM" || salesTab === "TODAY") {
      fetchCustomDateSales(selectedSalesDate);
    }
  }, [selectedSalesDate, salesTab]);

  const formatDailyDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-");
    if (!y || !m || !d) return dateStr;
    return `${y}년 ${parseInt(m, 10)}월 ${parseInt(d, 10)}일`;
  };

  const formatMonthlyDate = (ymStr: string) => {
    const [y, m] = ymStr.split("-");
    if (!y || !m) return ymStr;
    return `${y}년 ${parseInt(m, 10)}월`;
  };

  const formatOrderDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("ko-KR");
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("ko-KR");
  };

  const scrollToStats = () => {
    setSalesTab("ALL");
    document.getElementById("sales-stats")?.scrollIntoView({ behavior: "smooth" });
  };

  // 랭킹 바 백분율 계산용 최대값
  const maxQty = stats?.topQuantityProducts?.[0]?.quantity || 1;
  const maxRev = stats?.topRevenueProducts?.[0]?.revenue || 1;

  // 최근 7일 일별 매출 목록 (최신 일자가 맨 위로 오도록 역순 정렬)
  const displayDailySales = [...(stats?.dailySales ?? [])].reverse();

  // 일별/월별 매출 비율 계산용 최대 매출액
  const maxDailyRev =
    displayDailySales.length > 0
      ? Math.max(...displayDailySales.map((d) => d.revenue), 1)
      : 1;

  // 연도별 매출 집계 (전체 탭용, 최신 연도가 맨 위로 오도록 내림차순 정렬)
  const yearlySalesMap = new Map<string, { orderCount: number; revenue: number }>();
  stats?.monthlySales?.forEach((m) => {
    const year = m.yearMonth.substring(0, 4) + "년";
    const existing = yearlySalesMap.get(year) || { orderCount: 0, revenue: 0 };
    existing.orderCount += m.orderCount;
    existing.revenue += m.revenue;
    yearlySalesMap.set(year, existing);
  });
  const yearlySales = Array.from(yearlySalesMap.entries())
    .map(([year, data]) => ({
      year,
      orderCount: data.orderCount,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.year.localeCompare(a.year));

  const maxYearlyRev =
    yearlySales.length > 0 ? Math.max(...yearlySales.map((y) => y.revenue), 1) : 1;

  // 최근 6개월 월별 매출 목록 (최신 월이 맨 위로 오도록 역순 정렬)
  const displayMonthlySales = [...(stats?.monthlySales?.slice(-6) ?? [])].reverse();

  const maxMonthlyRev =
    displayMonthlySales.length > 0
      ? Math.max(...displayMonthlySales.map((m) => m.revenue), 1)
      : 1;

  // 선택 일자 집계
  const customActiveOrders = customOrders.filter((o) => o.status !== "CANCELLED");
  const customTotalRevenue = customActiveOrders.reduce(
    (sum, o) => sum + o.totalPrice,
    0,
  );
  const customOrderCount = customActiveOrders.length;
  const customAov =
    customOrderCount > 0 ? Math.round(customTotalRevenue / customOrderCount) : 0;

  // 선택 일자 상품별 판매 현황 집계
  const productMap = new Map<string, { quantity: number; revenue: number }>();
  customActiveOrders.forEach((o) => {
    const totalOrderQty =
      o.orderItems?.reduce((sum, it) => sum + it.quantity, 0) || 1;
    o.orderItems?.forEach((item) => {
      const existing = productMap.get(item.productName) || {
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue += Math.round(
        (o.totalPrice * item.quantity) / (totalOrderQty || 1),
      );
      productMap.set(item.productName, existing);
    });
  });
  const customProductList = Array.from(productMap.entries())
    .map(([productName, data]) => ({
      productName,
      quantity: data.quantity,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);
  const customMaxProductRev =
    customProductList.length > 0 ? customProductList[0].revenue : 1;

  return (
    <div className="space-y-8">
      {/* 상단 환영 헤더 */}
      <div className="flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-[#9A7655]">DASHBOARD</p>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            안녕하세요, 관리자님.
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            오늘의 쇼핑몰 현황과 주요 지표를 확인해보세요.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-500 shadow-sm">
          {new Date().toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* 상단 4개 핵심 지표 카드 */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. 등록 상품 */}
        <Link
          href="/admin/products"
          className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">등록 상품</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-3xl font-bold tracking-tight text-neutral-900">
                  {loading ? "-" : productCount}
                </span>
                {!loading && (
                  <span className="mb-1 text-sm font-medium text-neutral-500">
                    개
                  </span>
                )}
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4EEE8] text-xl text-[#8A684A]">
              ◇
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
            <span className="text-xs text-neutral-400">현재 등록된 상품</span>
            <span className="text-sm text-neutral-400 transition group-hover:translate-x-1">
              →
            </span>
          </div>
        </Link>

        {/* 2. 전체 주문 */}
        <Link
          href="/admin/orders"
          className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">전체 주문</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-3xl font-bold tracking-tight text-neutral-900">
                  {loading ? "-" : stats?.totalOrders ?? orders.length}
                </span>
                {!loading && (
                  <span className="mb-1 text-sm font-medium text-neutral-500">
                    건
                  </span>
                )}
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF2F7] text-xl text-[#64748B]">
              ▤
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
            <span className="text-xs text-neutral-400">누적 주문</span>
            <span className="text-sm text-neutral-400 transition group-hover:translate-x-1">
              →
            </span>
          </div>
        </Link>

        {/* 3. 오늘 배송 대상 */}
        <Link
          href="/admin/orders?filter=TODAY"
          className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                오늘 배송 대상
              </p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-3xl font-bold tracking-tight text-neutral-900">
                  {loading ? "-" : stats?.todayDeliveries ?? 0}
                </span>
                {!loading && (
                  <span className="mb-1 text-sm font-medium text-neutral-500">
                    건
                  </span>
                )}
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF5EE] text-xl text-[#638063]">
              ✓
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
            <span className="text-xs text-neutral-400">
              오늘 배송 대상 주문
            </span>
            <span className="text-sm text-neutral-400 transition group-hover:translate-x-1">
              →
            </span>
          </div>
        </Link>

        {/* 4. 총 누적 매출 (클릭 시 하단 매출 통계로 스무스 스크롤 이동) */}
        <div
          onClick={scrollToStats}
          className="group cursor-pointer rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">총 누적 매출</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-2xl font-bold tracking-tight text-neutral-900 lg:text-3xl">
                  {loading ? "-" : formatPrice(stats?.totalRevenue ?? 0)}
                </span>
                {!loading && (
                  <span className="mb-1 text-sm font-medium text-neutral-500">
                    원
                  </span>
                )}
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAF4ED] text-lg font-bold text-[#8A684A]">
              ₩
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
            <span className="text-xs text-neutral-400">매출 통계 보기</span>
            <span className="text-sm text-neutral-400 transition group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </section>

      {/* 중단: 인기 원두 TOP 3 랭킹 카드 2개 (수량별 vs 매출별) */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 판매 수량 TOP 3 */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                판매 수량 TOP 3
              </h2>
            </div>
            <span className="rounded-lg bg-[#FAF7F3] px-2.5 py-1 text-xs font-medium text-[#8A684A]">
              수량 기준
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {stats?.topQuantityProducts && stats.topQuantityProducts.length > 0 ? (
              stats.topQuantityProducts.map((item, idx) => {
                const percent = Math.round((item.quantity / maxQty) * 100);
                return (
                  <div key={item.productName} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                            idx === 0
                              ? "bg-[#1D1916] text-white"
                              : idx === 1
                                ? "bg-[#8A684A] text-white"
                                : "bg-neutral-200 text-neutral-700"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-neutral-800">
                          {item.productName}
                        </span>
                      </div>
                      <span className="font-bold text-neutral-900">
                        {item.quantity.toLocaleString("ko-KR")}개
                      </span>
                    </div>

                    {/* 시각화 프로그레스 바 */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0
                            ? "bg-[#1D1916]"
                            : idx === 1
                              ? "bg-[#8A684A]"
                              : "bg-neutral-400"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-6 text-center text-sm text-neutral-400">
                집계된 판매 데이터가 없습니다.
              </p>
            )}
          </div>
        </div>

        {/* 매출액 TOP 3 */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                매출액 TOP 3
              </h2>
            </div>
            <span className="rounded-lg bg-[#FAF7F3] px-2.5 py-1 text-xs font-medium text-[#8A684A]">
              매출 기준
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {stats?.topRevenueProducts && stats.topRevenueProducts.length > 0 ? (
              stats.topRevenueProducts.map((item, idx) => {
                const percent = Math.round((item.revenue / maxRev) * 100);
                return (
                  <div key={item.productName} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                            idx === 0
                              ? "bg-[#1D1916] text-white"
                              : idx === 1
                                ? "bg-[#8A684A] text-white"
                                : "bg-neutral-200 text-neutral-700"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-neutral-800">
                          {item.productName}
                        </span>
                      </div>
                      <span className="font-bold text-neutral-900">
                        {formatPrice(item.revenue)}원
                      </span>
                    </div>

                    {/* 시각화 프로그레스 바 */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0
                            ? "bg-[#1D1916]"
                            : idx === 1
                              ? "bg-[#8A684A]"
                              : "bg-neutral-400"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-6 text-center text-sm text-neutral-400">
                집계된 매출 데이터가 없습니다.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 하단: 일별 / 월별 / 특정일 선택 매출 통계 */}
      <section
        id="sales-stats"
        className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
      >
        <div className="flex flex-col gap-3 border-b border-neutral-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-neutral-900">매출 통계 현황</h2>
            <p className="mt-1 text-sm text-neutral-400">
              기간별 주문 발생 추이와 매출액을 확인합니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm">
            <button
              type="button"
              onClick={() => setSalesTab("ALL")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                salesTab === "ALL"
                  ? "bg-[#1D1916] text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedSalesDate(todayStr);
                setSalesTab("TODAY");
              }}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                salesTab === "TODAY"
                  ? "bg-[#A77A52] text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              오늘
            </button>
            <button
              type="button"
              onClick={() => setSalesTab("DAILY")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                salesTab === "DAILY"
                  ? "bg-[#1D1916] text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              최근 7일
            </button>
            <button
              type="button"
              onClick={() => setSalesTab("MONTHLY")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                salesTab === "MONTHLY"
                  ? "bg-[#1D1916] text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              최근 6개월
            </button>

            {/* 캘린더 드롭다운 날짜 선택 */}
            <div className="relative flex items-center gap-2 border-l border-neutral-200 pl-2">
              <span className="text-xs font-medium text-neutral-500">
                주문일:
              </span>
              <button
                type="button"
                onClick={() => setIsCalendarOpen((prev) => !prev)}
                className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                  salesTab === "CUSTOM"
                    ? "border-[#A77A52] bg-[#FAF7F3] font-semibold text-[#8A684A]"
                    : "border-neutral-200 bg-[#FAFAF9] text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <span>{selectedSalesDate}</span>
              </button>

              {isCalendarOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsCalendarOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
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

                    <div className="mt-2.5 grid grid-cols-7 text-center text-[11px] font-semibold text-neutral-400">
                      <span className="text-red-500">일</span>
                      <span>월</span>
                      <span>화</span>
                      <span>수</span>
                      <span>목</span>
                      <span>금</span>
                      <span className="text-blue-500">토</span>
                    </div>

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
                          selectedSalesDate === dateStr && salesTab === "CUSTOM";
                        const isToday = todayStr === dateStr;

                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              setSelectedSalesDate(dateStr);
                              setSalesTab("CUSTOM");
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

                    <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          setCalendarView({
                            year: d.getFullYear(),
                            month: d.getMonth(),
                          });
                          setSelectedSalesDate(todayStr);
                          setSalesTab("TODAY");
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

        <div className="overflow-x-auto">
          {salesTab === "DAILY" ? (
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-[#FAFAF9] text-left text-xs font-semibold text-neutral-500">
                  <th className="px-6 py-3.5">주문 일자</th>
                  <th className="w-32 px-4 py-3.5 text-center">주문 건수</th>
                  <th className="w-48 px-6 py-3.5 text-right">당일 매출액</th>
                  <th className="w-48 px-6 py-3.5">매출 비중</th>
                </tr>
              </thead>
              <tbody>
                {displayDailySales && displayDailySales.length > 0 ? (
                  displayDailySales.map((item) => {
                    const ratio = Math.round((item.revenue / maxDailyRev) * 100);
                    return (
                      <tr
                        key={item.date}
                        className="border-t border-neutral-100 transition hover:bg-[#FCFBF9]"
                      >
                        <td className="px-6 py-4 text-sm text-neutral-500">
                          {formatDailyDate(item.date)}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-semibold text-neutral-700">
                          {item.orderCount}건
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-neutral-900">
                          {formatPrice(item.revenue)}원
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                              <div
                                className="h-full rounded-full bg-[#8A684A] transition-all duration-300"
                                style={{ width: `${ratio}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-xs text-neutral-400">
                              {ratio}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-sm text-neutral-400"
                    >
                      조회된 일별 매출 데이터가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : salesTab === "ALL" ? (
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-[#FAFAF9] text-left text-xs font-semibold text-neutral-500">
                  <th className="px-6 py-3.5">기준 연도</th>
                  <th className="w-32 px-4 py-3.5 text-center">주문 건수</th>
                  <th className="w-48 px-6 py-3.5 text-right">연 매출액</th>
                  <th className="w-48 px-6 py-3.5">매출 비중</th>
                </tr>
              </thead>
              <tbody>
                {yearlySales && yearlySales.length > 0 ? (
                  yearlySales.map((item) => {
                    const ratio = Math.round(
                      (item.revenue / maxYearlyRev) * 100,
                    );
                    return (
                      <tr
                        key={item.year}
                        className="border-t border-neutral-100 transition hover:bg-[#FCFBF9]"
                      >
                        <td className="px-6 py-4 text-sm text-neutral-500">
                          {item.year}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-semibold text-neutral-700">
                          {item.orderCount}건
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-neutral-900">
                          {formatPrice(item.revenue)}원
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                              <div
                                className="h-full rounded-full bg-[#1D1916] transition-all duration-300"
                                style={{ width: `${ratio}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-xs text-neutral-400">
                              {ratio}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-sm text-neutral-400"
                    >
                      조회된 연도별 매출 데이터가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : salesTab === "MONTHLY" ? (
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-[#FAFAF9] text-left text-xs font-semibold text-neutral-500">
                  <th className="px-6 py-3.5">기준 월</th>
                  <th className="w-32 px-4 py-3.5 text-center">주문 건수</th>
                  <th className="w-48 px-6 py-3.5 text-right">월 매출액</th>
                  <th className="w-48 px-6 py-3.5">매출 비중</th>
                </tr>
              </thead>
              <tbody>
                {displayMonthlySales && displayMonthlySales.length > 0 ? (
                  displayMonthlySales.map((item) => {
                    const ratio = Math.round(
                      (item.revenue / maxMonthlyRev) * 100,
                    );
                    return (
                      <tr
                        key={item.yearMonth}
                        className="border-t border-neutral-100 transition hover:bg-[#FCFBF9]"
                      >
                        <td className="px-6 py-4 text-sm text-neutral-500">
                          {formatMonthlyDate(item.yearMonth)}
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-semibold text-neutral-700">
                          {item.orderCount}건
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-neutral-900">
                          {formatPrice(item.revenue)}원
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                              <div
                                className="h-full rounded-full bg-[#1D1916] transition-all duration-300"
                                style={{ width: `${ratio}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-xs text-neutral-400">
                              {ratio}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-sm text-neutral-400"
                    >
                      조회된 월별 매출 데이터가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            /* 선택 일자(TODAY 또는 CUSTOM) 통계 분석 및 상품별 판매 현황 */
            <div className="p-6 space-y-6">
              {/* 3대 핵심 KPI 통계 카드 */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-neutral-200 bg-[#FAFAF9] p-4">
                  <p className="text-xs font-medium text-neutral-500">당일 결제 매출</p>
                  <p className="mt-2 text-xl font-bold text-neutral-900">
                    {customLoading ? "-" : `${formatPrice(customTotalRevenue)}원`}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-[#FAFAF9] p-4">
                  <p className="text-xs font-medium text-neutral-500">정상 주문 건수</p>
                  <p className="mt-2 text-xl font-bold text-neutral-900">
                    {customLoading ? "-" : `${customOrderCount}건`}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-[#FAFAF9] p-4">
                  <p className="text-xs font-medium text-neutral-500">건당 평균 결제액</p>
                  <p className="mt-2 text-xl font-bold text-[#8A684A]">
                    {customLoading ? "-" : `${formatPrice(customAov)}원`}
                  </p>
                </div>
              </div>

              {/* 상품별 판매 기여도 테이블 */}
              <div>
                <h3 className="mb-3 text-xs font-bold text-neutral-700">
                  {salesTab === "TODAY" ? "오늘" : formatDailyDate(selectedSalesDate)} 판매 상품별 기여도
                </h3>
                <div className="overflow-x-auto rounded-xl border border-neutral-200">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="bg-[#FAFAF9] text-left text-xs font-semibold text-neutral-500">
                        <th className="px-6 py-3">판매 상품</th>
                        <th className="w-28 px-4 py-3 text-center">판매 수량</th>
                        <th className="w-40 px-6 py-3 text-right">판매 금액</th>
                        <th className="w-44 px-6 py-3">매출 비중</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customLoading ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-sm text-neutral-400">
                            통계 데이터를 불러오는 중...
                          </td>
                        </tr>
                      ) : customProductList.length > 0 ? (
                        customProductList.map((item) => {
                          const ratio = Math.round(
                            (item.revenue / (customTotalRevenue || 1)) * 100,
                          );
                          return (
                            <tr
                              key={item.productName}
                              className="border-t border-neutral-100 transition hover:bg-[#FCFBF9]"
                            >
                              <td className="px-6 py-3.5 text-sm font-semibold text-neutral-800">
                                {item.productName}
                              </td>
                              <td className="px-4 py-3.5 text-center text-sm font-semibold text-neutral-700">
                                {item.quantity}개
                              </td>
                              <td className="px-6 py-3.5 text-right text-sm font-bold text-neutral-900">
                                {formatPrice(item.revenue)}원
                              </td>
                              <td className="px-6 py-3.5">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                                    <div
                                      className="h-full rounded-full bg-[#8A684A] transition-all duration-300"
                                      style={{ width: `${ratio}%` }}
                                    />
                                  </div>
                                  <span className="w-8 text-right text-xs text-neutral-400">
                                    {ratio}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-sm text-neutral-400">
                            해당 일자에 판매된 데이터가 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 맨 하단: 최근 접수된 주문 5건 */}
      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
          <div>
            <h2 className="font-semibold text-neutral-900">최근 주문</h2>
            <p className="mt-1 text-sm text-neutral-400">
              최근 접수된 주문 내역입니다.
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
          >
            전체보기 →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="bg-[#FAFAF9] text-left text-xs font-semibold text-neutral-500">
                <th className="w-14 px-3 py-4 text-center whitespace-nowrap">
                  번호
                </th>
                <th className="w-72 px-6 py-4">이메일</th>
                <th className="w-48 px-4 py-4 whitespace-nowrap">주문일시</th>
                <th className="px-4 py-4 text-right whitespace-nowrap">
                  결제금액
                </th>
                <th className="w-28 px-4 py-4 text-center whitespace-nowrap">
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr
                  key={order.id}
                  className="border-t border-neutral-100 transition hover:bg-[#FCFBF9]"
                >
                  <td className="px-3 py-5 text-center text-sm text-neutral-400">
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
                  <td className="px-4 py-5 text-sm text-neutral-500 whitespace-nowrap">
                    {formatOrderDateTime(order.orderDate)}
                  </td>
                  <td className="px-4 py-5 text-right text-sm font-semibold text-neutral-800 whitespace-nowrap">
                    {formatPrice(order.totalPrice)}원
                  </td>
                  <td className="px-3 py-5 text-center whitespace-nowrap">
                    <span className={statusBadge(order.status)}>
                      {statusLabel(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && orders.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-neutral-400"
                  >
                    아직 등록된 주문이 없습니다.
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
