"use client";

import { type DailySales, type MonthlySales } from "@/types/stats";
import CalendarDropdown from "@/components/common/CalendarDropdown";
import DaySalesDetail from "./DaySalesDetail";
import { formatDailyDate, formatMonthlyDate, formatPrice } from "@/lib/format";

export type SalesTab = "ALL" | "TODAY" | "DAILY" | "MONTHLY" | "CUSTOM";

interface YearlySalesItem {
  year: string;
  orderCount: number;
  revenue: number;
}

interface CustomProductItem {
  productName: string;
  quantity: number;
  revenue: number;
}

interface SalesTimelineSectionProps {
  salesTab: SalesTab;
  onSalesTabChange: (tab: SalesTab) => void;
  selectedSalesDate: string;
  onSelectSalesDate: (date: string) => void;
  displayDailySales: DailySales[];
  yearlySales: YearlySalesItem[];
  displayMonthlySales: MonthlySales[];
  customLoading: boolean;
  customTotalRevenue: number;
  customOrderCount: number;
  customAov: number;
  customProductList: CustomProductItem[];
}

export default function SalesTimelineSection({
  salesTab,
  onSalesTabChange,
  selectedSalesDate,
  onSelectSalesDate,
  displayDailySales,
  yearlySales,
  displayMonthlySales,
  customLoading,
  customTotalRevenue,
  customOrderCount,
  customAov,
  customProductList,
}: SalesTimelineSectionProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  // 각 탭별 전체 매출 합계 (매출 비중 % 분모)
  const totalDailyRev =
    displayDailySales.reduce((sum, d) => sum + d.revenue, 0) || 1;
  const totalYearlyRev =
    yearlySales.reduce((sum, y) => sum + y.revenue, 0) || 1;
  const totalMonthlyRev =
    displayMonthlySales.reduce((sum, m) => sum + m.revenue, 0) || 1;

  return (
    <section
      id="sales-stats"
      className="rounded-2xl border border-neutral-200 bg-white shadow-sm"
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
            onClick={() => onSalesTabChange("ALL")}
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
              onSelectSalesDate(todayStr);
              onSalesTabChange("TODAY");
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
            onClick={() => onSalesTabChange("DAILY")}
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
            onClick={() => onSalesTabChange("MONTHLY")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              salesTab === "MONTHLY"
                ? "bg-[#1D1916] text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            최근 6개월
          </button>

          <CalendarDropdown
            selectedDate={selectedSalesDate}
            onSelectDate={(date) => {
              onSelectSalesDate(date);
              onSalesTabChange("CUSTOM");
            }}
            labelPrefix="주문일:"
            isActive={salesTab === "CUSTOM"}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-b-2xl">
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
                  const ratio = Math.round(
                    (item.revenue / totalDailyRev) * 100,
                  );
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
                    (item.revenue / totalYearlyRev) * 100,
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
                    (item.revenue / totalMonthlyRev) * 100,
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
                    조회된 월별 매출 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <DaySalesDetail
            salesTab={salesTab}
            selectedSalesDate={selectedSalesDate}
            customLoading={customLoading}
            customTotalRevenue={customTotalRevenue}
            customOrderCount={customOrderCount}
            customAov={customAov}
            customProductList={customProductList}
          />
        )}
      </div>
    </section>
  );
}
