"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  id: number;
  email: string;
  orderDate: string;
  totalPrice: number;
  status: string;
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  ORDERED: "주문 완료",
  SHIPPED: "배송 중",
  DELIVERED: "배송 완료",
};

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
          "http://localhost:8080/api/v1/orders"
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

  // 오늘 주문
  const today = new Date().toDateString();

  const todayOrderCount = orders.filter((order) => {
    return new Date(order.orderDate).toDateString() === today;
  }).length;

  // 최근 주문 5건
  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.orderDate).getTime() -
        new Date(a.orderDate).getTime()
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
          <p className="mb-2 text-sm font-medium text-[#9A7655]">
            DASHBOARD
          </p>

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
              <p className="text-sm font-medium text-neutral-500">
                등록 상품
              </p>

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
            <span className="text-xs text-neutral-400">
              현재 등록된 상품
            </span>

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
              <p className="text-sm font-medium text-neutral-500">
                전체 주문
              </p>

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
            <span className="text-xs text-neutral-400">
              누적 주문
            </span>

            <span className="text-sm text-neutral-400 transition group-hover:translate-x-1">
              →
            </span>
          </div>
        </Link>

        {/* 오늘 주문 */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">
                오늘 주문
              </p>

              <div className="mt-4 flex items-end gap-1">
                <span className="text-3xl font-bold tracking-tight text-neutral-900">
                  {loading ? "-" : todayOrderCount}
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

          <div className="mt-6 border-t border-neutral-100 pt-4">
            <span className="text-xs text-neutral-400">
              오늘 접수된 주문
            </span>
          </div>
        </div>
      </section>

      {/* 최근 주문 */}
      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
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
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500">
                <th className="px-6 py-4">주문번호</th>
                <th className="px-6 py-4">이메일</th>
                <th className="px-6 py-4">주문일</th>
                <th className="px-6 py-4">결제금액</th>
                <th className="px-6 py-4">상태</th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-neutral-100 text-sm transition hover:bg-neutral-50"
                >
                  <td className="px-6 py-4 font-medium text-neutral-900">
                    #{order.id}
                  </td>

                  <td className="px-6 py-4 text-neutral-600">
                    {order.email}
                  </td>

                  <td className="px-6 py-4 text-neutral-500">
                    {formatDate(order.orderDate)}
                  </td>

                  <td className="px-6 py-4 font-medium text-neutral-800">
                    {formatPrice(order.totalPrice)}원
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                      {ORDER_STATUS_LABEL[order.status] ?? order.status}
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