import { Fragment } from "react";
import { type Order, type OrderStatus } from "@/types/order";
import StatusBadge from "@/components/common/StatusBadge";
import OrderDetailAccordion from "./OrderDetailAccordion";
import { formatDateTime, formatDeliveryDate, formatPrice } from "@/lib/format";

interface OrderTableProps {
  orders: Order[];
  page: number;
  error: string;
  sortBy: "orderDate" | "totalPrice";
  sortDir: "desc" | "asc";
  onSortToggle: (field: "orderDate" | "totalPrice") => void;
  selectedOrder: Order | null;
  onToggleSelectOrder: (orderId: number) => void;
  onStatusChange: (orderId: number, nextStatus: OrderStatus) => void;
  detailLoading: boolean;
  detailError: string;
  onCloseDetail: () => void;
}

export default function OrderTable({
  orders,
  page,
  error,
  sortBy,
  sortDir,
  onSortToggle,
  selectedOrder,
  onToggleSelectOrder,
  onStatusChange,
  detailLoading,
  detailError,
  onCloseDetail,
}: OrderTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] table-fixed">
        <thead>
          <tr className="bg-[#FAFAF9] text-left text-xs font-semibold text-neutral-500">
            <th className="w-14 px-3 py-4 text-center whitespace-nowrap">
              번호
            </th>
            <th className="px-6 py-4">이메일</th>
            <th className="w-36 px-4 py-4 whitespace-nowrap">배송일자</th>
            <th
              onClick={() => onSortToggle("orderDate")}
              className="w-48 cursor-pointer select-none px-4 py-4 whitespace-nowrap transition hover:bg-neutral-100/80"
              title="클릭하여 주문일시 정렬 변경"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={
                    sortBy === "orderDate"
                      ? "font-bold text-neutral-900"
                      : "text-neutral-500"
                  }
                >
                  주문일시
                </span>
                <span className="text-xs">
                  {sortBy === "orderDate" ? (
                    sortDir === "desc" ? (
                      <span className="font-bold text-[#8A684A]">↓</span>
                    ) : (
                      <span className="font-bold text-[#8A684A]">↑</span>
                    )
                  ) : (
                    <span className="text-neutral-300">↕</span>
                  )}
                </span>
              </div>
            </th>
            <th className="w-28 px-3 py-4 text-center whitespace-nowrap">
              상태
            </th>
            <th
              onClick={() => onSortToggle("totalPrice")}
              className="w-36 cursor-pointer select-none px-4 py-4 text-right whitespace-nowrap transition hover:bg-neutral-100/80"
              title="클릭하여 결제금액 정렬 변경"
            >
              <div className="flex items-center justify-end gap-1.5">
                <span
                  className={
                    sortBy === "totalPrice"
                      ? "font-bold text-neutral-900"
                      : "text-neutral-500"
                  }
                >
                  결제금액
                </span>
                <span className="text-xs">
                  {sortBy === "totalPrice" ? (
                    sortDir === "desc" ? (
                      <span className="font-bold text-[#8A684A]">↓</span>
                    ) : (
                      <span className="font-bold text-[#8A684A]">↑</span>
                    )
                  ) : (
                    <span className="text-neutral-300">↕</span>
                  )}
                </span>
              </div>
            </th>
            <th className="w-28 px-3 py-4 text-center whitespace-nowrap">
              상태 변경
            </th>
            <th className="w-24 px-3 py-4 text-center whitespace-nowrap">
              상세
            </th>
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
                  {page * 10 + index + 1}
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
                  {formatDeliveryDate(order.deliveryDate)}
                </td>

                <td className="px-4 py-5 text-sm text-neutral-500 whitespace-nowrap">
                  {formatDateTime(order.orderDate)}
                </td>

                <td className="px-3 py-5 text-center whitespace-nowrap">
                  <StatusBadge status={order.status} />
                </td>

                <td className="px-4 py-5 text-right text-sm font-semibold text-neutral-800 whitespace-nowrap">
                  {formatPrice(order.totalPrice)}원
                </td>

                {/* 원클릭 상태 변경 액션 버튼 */}
                <td className="px-3 py-5 text-center whitespace-nowrap">
                  {order.status === "ORDERED" && (
                    <button
                      type="button"
                      onClick={() => onStatusChange(order.id, "SHIPPED")}
                      className="cursor-pointer rounded-lg bg-[#A77A52] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#8A684A]"
                    >
                      배송 시작
                    </button>
                  )}
                  {order.status === "SHIPPED" && (
                    <button
                      type="button"
                      onClick={() => onStatusChange(order.id, "DELIVERED")}
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
                    onClick={() => onToggleSelectOrder(order.id)}
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

              {/* 주문 상세 아코디언 컴포넌트 */}
              {selectedOrder?.id === order.id && (
                <OrderDetailAccordion
                  order={selectedOrder}
                  loading={detailLoading}
                  error={detailError}
                  onClose={onCloseDetail}
                />
              )}
            </Fragment>
          ))}

          {orders.length === 0 && !error && (
            <tr>
              <td colSpan={8} className="px-6 py-16 text-center">
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
  );
}
