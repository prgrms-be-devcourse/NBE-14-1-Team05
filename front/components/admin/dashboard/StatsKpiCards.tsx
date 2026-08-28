import Link from "next/link";
import { type AdminStats } from "@/types/stats";
import { formatPrice } from "@/lib/format";

interface StatsKpiCardsProps {
  stats: AdminStats | null;
  productCount: number;
  ordersCount: number;
  loading: boolean;
  onTotalRevenueClick: () => void;
}

export default function StatsKpiCards({
  stats,
  productCount,
  ordersCount,
  loading,
  onTotalRevenueClick,
}: StatsKpiCardsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-5">
      {/* 1. 등록 상품 */}
      <Link
        href="/admin/products"
        className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 xl:p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-500">
              등록 상품
            </p>
            <div className="mt-3.5 flex items-end gap-1 xl:mt-4">
              <span className="whitespace-nowrap tabular-nums text-2xl font-bold tracking-tight text-neutral-900">
                {loading ? "-" : productCount.toLocaleString()}
              </span>
              {!loading && (
                <span className="mb-0.5 shrink-0 text-sm font-medium text-neutral-500 xl:mb-1">
                  개
                </span>
              )}
            </div>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4EEE8] text-xl text-[#8A684A] xl:h-11 xl:w-11">
            ◇
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
          <span className="truncate text-xs text-neutral-400">
            현재 등록된 상품
          </span>
          <span className="shrink-0 text-sm text-neutral-400 transition group-hover:translate-x-1">
            →
          </span>
        </div>
      </Link>

      {/* 2. 전체 주문 */}
      <Link
        href="/admin/orders"
        className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 xl:p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-500">
              전체 주문
            </p>
            <div className="mt-3.5 flex items-end gap-1 xl:mt-4">
              <span className="whitespace-nowrap tabular-nums text-2xl font-bold tracking-tight text-neutral-900">
                {loading ? "-" : (stats?.totalOrders ?? ordersCount).toLocaleString()}
              </span>
              {!loading && (
                <span className="mb-0.5 shrink-0 text-sm font-medium text-neutral-500 xl:mb-1">
                  건
                </span>
              )}
            </div>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF2F7] text-xl text-[#64748B] xl:h-11 xl:w-11">
            ▤
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
          <span className="truncate text-xs text-neutral-400">
            누적 주문
          </span>
          <span className="shrink-0 text-sm text-neutral-400 transition group-hover:translate-x-1">
            →
          </span>
        </div>
      </Link>

      {/* 3. 오늘 배송 대상 */}
      <Link
        href="/admin/orders?filter=TODAY"
        className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 xl:p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-500">
              오늘 배송 대상
            </p>
            <div className="mt-3.5 flex items-end gap-1 xl:mt-4">
              <span className="whitespace-nowrap tabular-nums text-2xl font-bold tracking-tight text-neutral-900">
                {loading ? "-" : (stats?.todayDeliveries ?? 0).toLocaleString()}
              </span>
              {!loading && (
                <span className="mb-0.5 shrink-0 text-sm font-medium text-neutral-500 xl:mb-1">
                  건
                </span>
              )}
            </div>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF5EE] text-xl text-[#638063] xl:h-11 xl:w-11">
            ✓
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
          <span className="truncate text-xs text-neutral-400">
            오늘 배송 대상 주문
          </span>
          <span className="shrink-0 text-sm text-neutral-400 transition group-hover:translate-x-1">
            →
          </span>
        </div>
      </Link>

      {/* 4. 총 누적 매출 (클릭 시 하단 매출 통계로 스무스 스크롤 이동) */}
      <div
        onClick={onTotalRevenueClick}
        className="group cursor-pointer overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 xl:p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-500">
              총 누적 매출
            </p>
            <div className="mt-3.5 flex items-end gap-1 xl:mt-4">
              <span className="whitespace-nowrap tabular-nums text-2xl font-bold tracking-tight text-neutral-900">
                {loading ? "-" : formatPrice(stats?.totalRevenue ?? 0)}
              </span>
              {!loading && (
                <span className="mb-0.5 shrink-0 text-sm font-medium text-neutral-500 xl:mb-1">
                  원
                </span>
              )}
            </div>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF4ED] text-lg font-bold text-[#8A684A] xl:h-11 xl:w-11">
            ₩
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
          <span className="truncate text-xs text-neutral-400">
            매출 통계 보기
          </span>
          <span className="shrink-0 text-sm text-neutral-400 transition group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </section>
  );
}
