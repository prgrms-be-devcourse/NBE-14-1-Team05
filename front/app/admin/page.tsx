"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ORDER_STATUS_LABEL,
  type Order,
  type OrderStatus,
} from "@/types/order";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 상품 조회
        const productResponse = await fetch("/api/admin/products");

        if (!productResponse.ok) {
          throw new Error("상품 조회 실패");
        }

        const products = await productResponse.json();
        setProductCount(products.totalElements);

        // 주문 조회
        const orderResponse = await fetch(
          "http://localhost:8080/api/v1/admin/orders",
        );

        if (!orderResponse.ok) {
          throw new Error("주문 조회 실패");
        }

        const orderData: Order[] = await orderResponse.json();
        setOrders(orderData);
      } catch (error) {
        console.error("대시보드 데이터 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // 오늘 배송 대상
  const today = new Date().toDateString();
  const todayDeliveryCount = orders.filter((order) => {
    return (
      order.deliveryDate &&
      new Date(order.deliveryDate).toDateString() === today
    );
  }).length;

  // 최근 주문 5건
  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
    )
    .slice(0, 5);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ko-KR");
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("ko-KR");
  };

  return (
    <div className="space-y-8">
      {/* 상단 */}
      <div className="flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-[#9A7655]">DASHBOARD</p>

          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            안녕하세요, 관리자님.
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            오늘의 쇼핑몰 현황을 확인해보세요.
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

      {/* 현황 카드 */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* 상품 */}
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

        {/* 전체 주문 */}
        <Link
          href="/admin/orders"
          className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">전체 주문</p>

              <div className="mt-4 flex items-end gap-1">
                <span className="text-3xl font-bold tracking-tight text-neutral-900">
                  {loading ? "-" : orders.length}
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

        {/* 오늘 배송 대상 */}
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
                  {loading ? "-" : todayDeliveryCount}
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
      </section>

      {/* 최근 주문 */}
      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
          <div>
            <h2 className="font-semibold text-neutral-900">
              최근 주문
            </h2>

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
                <th className="w-14 px-3 py-4 text-center whitespace-nowrap">번호</th>
                <th className="w-72 px-6 py-4">이메일</th>
                <th className="w-48 px-4 py-4 whitespace-nowrap">주문일시</th>
                <th className="px-4 py-4 text-right whitespace-nowrap">결제금액</th>
                <th className="w-28 px-4 py-4 text-center whitespace-nowrap">상태</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => (
                <tr
                  key={order.id}
                  className="border-t border-neutral-100 transition hover:bg-[#FCFBF9]"
                >
                  {/* 순번 (흐린 회색 1, 2, 3...) */}
                  <td className="px-3 py-5 text-center text-sm text-neutral-400">
                    {index + 1}
                  </td>
                  {/* 주문자 (이메일 + 주문번호 2줄 표시) */}
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
                  {/* 주문일시 */}
                  <td className="px-4 py-5 text-sm text-neutral-500 whitespace-nowrap">
                    {formatDate(order.orderDate)}
                  </td>
                  {/* 결제금액 */}
                  <td className="px-4 py-5 text-right text-sm font-semibold text-neutral-800 whitespace-nowrap">
                    {formatPrice(order.totalPrice)}원
                  </td>
                  {/* 상태 뱃지 */}
                  <td className="px-3 py-5 text-center whitespace-nowrap">
                    <span className={statusBadge(order.status)}>
                      {statusLabel(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && recentOrders.length === 0 && (
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
