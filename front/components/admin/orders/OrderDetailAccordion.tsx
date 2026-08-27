import { type Order } from "@/types/order";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDateTime, formatPrice } from "@/lib/format";

interface OrderDetailAccordionProps {
  order: Order | null;
  loading: boolean;
  error: string;
  onClose: () => void;
}

export default function OrderDetailAccordion({
  order,
  loading,
  error,
  onClose,
}: OrderDetailAccordionProps) {
  if (!order) return null;

  return (
    <tr className="border-t border-b border-neutral-200 bg-[#FAF9F7]">
      <td colSpan={8} className="p-8">
        {loading ? (
          <div className="py-8 text-center text-sm text-neutral-400">
            주문 상세를 불러오는 중입니다.
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        ) : (
          <div className="space-y-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <p className="text-xs font-medium text-[#9A7655]">ORDER DETAIL</p>
                <h2 className="mt-1 text-lg font-semibold text-neutral-900">
                  주문 상세 (#{order.id})
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
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
                  <p className="text-xs text-neutral-400">주문번호</p>
                  <p className="mt-2 text-sm font-semibold text-neutral-900">
                    #{order.id}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-neutral-400">주문 상태</p>
                  <div className="mt-2">
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-neutral-400">주문일시</p>
                  <p className="mt-2 text-sm font-medium text-neutral-700">
                    {formatDateTime(order.orderDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-neutral-400">결제금액</p>
                  <p className="mt-2 text-sm font-bold text-neutral-900">
                    {formatPrice(order.totalPrice)}원
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
                    {order.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-neutral-400">우편번호</p>
                  <p className="mt-1.5 text-sm font-medium text-neutral-700">
                    {order.postcode}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-neutral-400">주소</p>
                  <p className="mt-1.5 text-sm font-medium text-neutral-700">
                    {order.address}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-neutral-400">배송일</p>
                  <p className="mt-1.5 text-sm font-medium text-neutral-700">
                    {formatDateTime(order.deliveryDate)}
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
                    {(order.orderItems ?? []).map((item) => (
                      <tr key={item.id} className="border-t border-neutral-100">
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

                    {(!order.orderItems || order.orderItems.length === 0) && (
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
  );
}
