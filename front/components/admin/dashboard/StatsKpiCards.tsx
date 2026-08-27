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
                {loading ? "-" : stats?.totalOrders ?? ordersCount}
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
        onClick={onTotalRevenueClick}
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
  );
}
