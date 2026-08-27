import Link from "next/link";
import { type Order } from "@/types/order";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDateTime, formatPrice } from "@/lib/format";

interface RecentOrdersTableProps {
  orders: Order[];
  loading: boolean;
}

export default function RecentOrdersTable({
  orders,
  loading,
}: RecentOrdersTableProps) {
  return (
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
          className="text-xs font-semibold text-[#8A684A] transition hover:underline"
        >
          주문 전체보기 →
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
                  {formatDateTime(order.orderDate)}
                </td>
                <td className="px-4 py-5 text-right text-sm font-semibold text-neutral-800 whitespace-nowrap">
                  {formatPrice(order.totalPrice)}원
                </td>
                <td className="px-3 py-5 text-center whitespace-nowrap">
                  <StatusBadge status={order.status} />
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
  );
}
