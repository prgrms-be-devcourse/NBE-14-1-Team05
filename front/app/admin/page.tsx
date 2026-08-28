"use client";

import { useEffect, useState } from "react";
import { type Order } from "@/types/order";
import { type AdminStats } from "@/types/stats";
import StatsKpiCards from "@/components/admin/dashboard/StatsKpiCards";
import TopRankingSection from "@/components/admin/dashboard/TopRankingSection";
import SalesTimelineSection, { type SalesTab } from "@/components/admin/dashboard/SalesTimelineSection";
import RecentOrdersTable from "@/components/admin/dashboard/RecentOrdersTable";

export default function AdminPage() {
  const [productCount, setProductCount] = useState(0);
  const [productPrices, setProductPrices] = useState<Record<string, number>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrderCount, setTotalOrderCount] = useState(0);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [salesTab, setSalesTab] = useState<SalesTab>("ALL");
  const [loading, setLoading] = useState(true);

  // 캘린더 날짜 선택 및 해당 일자 주문 상태
  const [selectedSalesDate, setSelectedSalesDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [customOrders, setCustomOrders] = useState<Order[]>([]);
  const [customLoading, setCustomLoading] = useState(false);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 등록 상품 목록 및 단가 맵 조회
        const productResponse = await fetch("/api/admin/products?size=1000&filter=ALL");
        if (productResponse.ok) {
          const productData = await productResponse.json();
          const productList =
            productData.content ?? (Array.isArray(productData) ? productData : []);
          setProductCount(productData.totalElements ?? productList.length);
          
          const priceMap: Record<string, number> = {};
          productList.forEach((p: { name: string; price: number }) => {
            if (p.name && typeof p.price === "number") {
              priceMap[p.name] = p.price;
            }
          });
          setProductPrices(priceMap);
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
          setTotalOrderCount(orderData.totalElements ?? orderList.length);
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

  const scrollToStats = () => {
    setSalesTab("ALL");
    document.getElementById("sales-stats")?.scrollIntoView({ behavior: "smooth" });
  };

  // 최근 7일 일별 매출 목록 (최신 일자가 맨 위로 오도록 역순 정렬)
  const displayDailySales = [...(stats?.dailySales ?? [])].reverse();

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

  // 최근 6개월 월별 매출 목록 (최신 월이 맨 위로 오도록 역순 정렬)
  const displayMonthlySales = [...(stats?.monthlySales?.slice(-6) ?? [])].reverse();

  // 선택 일자 집계
  const customActiveOrders = customOrders.filter((o) => o.status !== "CANCELLED");
  const customTotalRevenue = customActiveOrders.reduce(
    (sum, o) => sum + o.totalPrice,
    0,
  );
  const customOrderCount = customActiveOrders.length;
  const customAov =
    customOrderCount > 0 ? Math.round(customTotalRevenue / customOrderCount) : 0;

  // 선택 일자 판매 상품별 수량 및 실제 단가 기반 매출 집계
  const productMap = new Map<string, { quantity: number; revenue: number }>();
  customActiveOrders.forEach((o) => {
    o.orderItems?.forEach((item) => {
      const existing = productMap.get(item.productName) || {
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += item.quantity;
      
      const unitPrice =
        productPrices[item.productName] ??
        (o.totalPrice && o.orderItems.length === 1
          ? Math.round(o.totalPrice / item.quantity)
          : 0);
      existing.revenue += unitPrice * item.quantity;
      productMap.set(item.productName, existing);
    });
  });

  const customProductList = Array.from(productMap.entries())
    .map(([name, data]) => ({
      productName: name,
      quantity: data.quantity,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-8">
      {/* 대시보드 타이틀 헤더 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-[#9A7655]">OVERVIEW</p>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            관리자 대시보드
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
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

      {/* 상단 4대 핵심 지표 카드 */}
      <StatsKpiCards
        stats={stats}
        productCount={productCount}
        ordersCount={totalOrderCount}
        loading={loading}
        onTotalRevenueClick={scrollToStats}
      />

      {/* 인기 원두 TOP 3 랭킹 카드 */}
      <TopRankingSection
        topQuantityProducts={stats?.topQuantityProducts}
        topRevenueProducts={stats?.topRevenueProducts}
      />

      {/* 기간별 매출 통계 현황 섹션 */}
      <SalesTimelineSection
        salesTab={salesTab}
        onSalesTabChange={setSalesTab}
        selectedSalesDate={selectedSalesDate}
        onSelectSalesDate={setSelectedSalesDate}
        displayDailySales={displayDailySales}
        yearlySales={yearlySales}
        displayMonthlySales={displayMonthlySales}
        customLoading={customLoading}
        customTotalRevenue={customTotalRevenue}
        customOrderCount={customOrderCount}
        customAov={customAov}
        customProductList={customProductList}
      />

      {/* 하단 최근 주문 목록 테이블 */}
      <RecentOrdersTable
        orders={orders}
        loading={loading}
      />
    </div>
  );
}
