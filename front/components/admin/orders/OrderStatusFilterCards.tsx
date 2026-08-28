import { type OrderStatus } from "@/types/order";

interface StatusCounts {
  total: number;
  ordered: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

interface OrderStatusFilterCardsProps {
  selectedStatus: "ALL" | OrderStatus;
  onSelectStatus: (status: "ALL" | OrderStatus) => void;
  statusCounts: StatusCounts;
}

export default function OrderStatusFilterCards({
  selectedStatus,
  onSelectStatus,
  statusCounts,
}: OrderStatusFilterCardsProps) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:gap-4">
      {/* 전체 주문 */}
      <div
        onClick={() => onSelectStatus("ALL")}
        className={`cursor-pointer overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
          selectedStatus === "ALL"
            ? "border-neutral-900 bg-[#FAFAF9] ring-2 ring-neutral-900"
            : "border-neutral-200 bg-white"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-500">전체 주문</p>
            <p className="mt-2.5 whitespace-nowrap tabular-nums text-xl font-bold text-neutral-900 sm:mt-3 sm:text-2xl">
              {statusCounts.total.toLocaleString()}
              <span className="ml-1 shrink-0 text-sm font-medium text-neutral-400">건</span>
            </p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 xl:h-10 xl:w-10">
            ▤
          </div>
        </div>
      </div>

      {/* 주문 완료 */}
      <div
        onClick={() => onSelectStatus("ORDERED")}
        className={`cursor-pointer overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
          selectedStatus === "ORDERED"
            ? "border-[#8A684A] bg-[#F5EEE7]/60 ring-2 ring-[#8A684A]"
            : "border-neutral-200 bg-white"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-500">주문 완료</p>
            <p className="mt-2.5 whitespace-nowrap tabular-nums text-xl font-bold text-neutral-900 sm:mt-3 sm:text-2xl">
              {statusCounts.ordered.toLocaleString()}
              <span className="ml-1 shrink-0 text-sm font-medium text-neutral-400">건</span>
            </p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5EEE7] text-[#8A684A] xl:h-10 xl:w-10">
            ✓
          </div>
        </div>
      </div>

      {/* 배송 중 */}
      <div
        onClick={() => onSelectStatus("SHIPPED")}
        className={`cursor-pointer overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
          selectedStatus === "SHIPPED"
            ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-500"
            : "border-neutral-200 bg-white"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-500">배송 중</p>
            <p className="mt-2.5 whitespace-nowrap tabular-nums text-xl font-bold text-neutral-900 sm:mt-3 sm:text-2xl">
              {statusCounts.shipped.toLocaleString()}
              <span className="ml-1 shrink-0 text-sm font-medium text-neutral-400">건</span>
            </p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 xl:h-10 xl:w-10">
            →
          </div>
        </div>
      </div>

      {/* 배송 완료 */}
      <div
        onClick={() => onSelectStatus("DELIVERED")}
        className={`cursor-pointer overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
          selectedStatus === "DELIVERED"
            ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500"
            : "border-neutral-200 bg-white"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-500">배송 완료</p>
            <p className="mt-2.5 whitespace-nowrap tabular-nums text-xl font-bold text-neutral-900 sm:mt-3 sm:text-2xl">
              {statusCounts.delivered.toLocaleString()}
              <span className="ml-1 shrink-0 text-sm font-medium text-neutral-400">건</span>
            </p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 xl:h-10 xl:w-10">
            ✓
          </div>
        </div>
      </div>

      {/* 주문 취소 */}
      <div
        onClick={() => onSelectStatus("CANCELLED")}
        className={`cursor-pointer overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
          selectedStatus === "CANCELLED"
            ? "border-red-500 bg-red-50/60 ring-2 ring-red-500"
            : "border-neutral-200 bg-white"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-500">주문 취소</p>
            <p className="mt-2.5 whitespace-nowrap tabular-nums text-xl font-bold text-neutral-900 sm:mt-3 sm:text-2xl">
              {statusCounts.cancelled.toLocaleString()}
              <span className="ml-1 shrink-0 text-sm font-medium text-neutral-400">건</span>
            </p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 xl:h-10 xl:w-10">
            ✕
          </div>
        </div>
      </div>
    </section>
  );
}
