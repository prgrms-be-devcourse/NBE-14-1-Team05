"use client";

import { useEffect, useState } from "react";
import {
  ORDER_STATUS_LABEL,
  type Order,
  type OrderStatus,
} from "@/types/order";

const ORDERS_API = "http://localhost:8080/api/v1/orders";

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ko-KR");
}

function statusLabel(status: OrderStatus) {
  return ORDER_STATUS_LABEL[status] ?? status;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);

  // 주문 목록 조회
  useEffect(() => {
    fetch(ORDERS_API)
      .then((response) => {
        if (!response.ok) {
          throw new Error("주문 목록을 불러오지 못했습니다.");
        }

        return response.json();
      })
      .then((data: Order[]) => {
        setOrders(data);
      })
      .catch((error) => {
        console.error("주문 조회 실패:", error);
        setError("주문 목록을 불러오지 못했습니다.");
      });
  }, []);

  // 주문 상세 조회
  const handleSelectOrder = async (id: number) => {
    setDetailError("");
    setDetailLoading(true);

    try {
      const response = await fetch(`${ORDERS_API}/${id}`);

      if (!response.ok) {
        throw new Error("주문 상세를 불러오지 못했습니다.");
      }

      const data: Order = await response.json();
      setSelectedOrder(data);
    } catch (error) {
      console.error("주문 상세 조회 실패:", error);
      setDetailError("주문 상세를 불러오지 못했습니다.");
      setSelectedOrder(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
      <div>
        {/* 페이지 상단 */}
        <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">
            주문 관리
          </h1>

          <p className="text-neutral-500 mt-2">
            접수된 주문을 조회하고 주문 상세 정보를 확인할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* 주문 목록 */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr className="text-left text-sm text-neutral-500">
              <th className="p-4">번호</th>
              <th className="p-4">이메일</th>
              <th className="p-4">주문일시</th>
              <th className="p-4">상태</th>
              <th className="p-4">결제금액</th>
              <th className="p-4">관리</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order, index) => (
              <tr
                key={order.id}
                className={`border-t border-neutral-200 ${
                  selectedOrder?.id === order.id ? "bg-neutral-50" : ""
                }`}
              >
                <td className="p-4">
                  {index + 1}
                </td>

                <td className="p-4">
                  {order.email}
                </td>

                <td className="p-4 text-neutral-600">
                  {formatDateTime(order.orderDate)}
                </td>

                <td className="p-4">
                  {statusLabel(order.status)}
                </td>

                <td className="p-4">
                  {order.totalPrice.toLocaleString()}원
                </td>

                <td className="p-4">
                  <button
                    type="button"
                    onClick={() => handleSelectOrder(order.id)}
                    className="hover:underline cursor-pointer"
                  >
                    상세
                  </button>
                </td>
              </tr>
            ))}

            {orders.length === 0 && !error && (
              <tr>
                <td
                  colSpan={6}
                  className="p-10 text-center text-neutral-400"
                >
                  접수된 주문이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 주문 상세 */}
      {(detailLoading || detailError || selectedOrder) && (
        <div className="mt-8 bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <div className="bg-neutral-50 p-4 text-sm text-neutral-500">
            주문 상세
          </div>

          {detailLoading && (
            <p className="p-6 text-neutral-400">
              주문 상세를 불러오는 중입니다.
            </p>
          )}

          {detailError && (
            <div className="m-4 rounded border border-red-200 bg-red-50 p-4 text-red-600">
              {detailError}
            </div>
          )}

          {!detailLoading && selectedOrder && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <p>
                  <span className="text-neutral-500">주문번호</span>
                  <span className="ml-3">{selectedOrder.id}</span>
                </p>

                <p>
                  <span className="text-neutral-500">상태</span>
                  <span className="ml-3">
                    {statusLabel(selectedOrder.status)}
                  </span>
                </p>

                <p>
                  <span className="text-neutral-500">이메일</span>
                  <span className="ml-3">{selectedOrder.email}</span>
                </p>

                <p>
                  <span className="text-neutral-500">주문일시</span>
                  <span className="ml-3">
                    {formatDateTime(selectedOrder.orderDate)}
                  </span>
                </p>

                <p>
                  <span className="text-neutral-500">주소</span>
                  <span className="ml-3">{selectedOrder.address}</span>
                </p>

                <p>
                  <span className="text-neutral-500">우편번호</span>
                  <span className="ml-3">{selectedOrder.postcode}</span>
                </p>

                <p>
                  <span className="text-neutral-500">배송일</span>
                  <span className="ml-3">
                    {formatDateTime(selectedOrder.deliveryDate)}
                  </span>
                </p>

                <p>
                  <span className="text-neutral-500">결제금액</span>
                  <span className="ml-3">
                    {selectedOrder.totalPrice.toLocaleString()}원
                  </span>
                </p>
              </div>

              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr className="text-left text-sm text-neutral-500">
                    <th className="p-4">상품명</th>
                    <th className="p-4">상품 ID</th>
                    <th className="p-4">수량</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedOrder.orderItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-neutral-200"
                    >
                      <td className="p-4">{item.productName}</td>
                      <td className="p-4 text-neutral-600">
                        {item.productId ?? "-"}
                      </td>
                      <td className="p-4">{item.quantity}</td>
                    </tr>
                  ))}

                  {selectedOrder.orderItems.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-10 text-center text-neutral-400"
                      >
                        주문 상품이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
