"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ORDER_STATUS_LABEL, type Order, type OrderStatus } from "@/types/order";
import OrderStatusFilterCards from "@/components/admin/orders/OrderStatusFilterCards";
import OrderFilterBar from "@/components/admin/orders/OrderFilterBar";
import OrderTable from "@/components/admin/orders/OrderTable";
import Pagination from "@/components/common/Pagination";

const ORDERS_API = "http://localhost:8080/api/v1/admin/orders";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter");
  const [filterMode, setFilterMode] = useState<"ALL" | "TODAY" | "DATE">(
    filterParam === "TODAY" ? "TODAY" : "ALL",
  );

  const [selectedStatus, setSelectedStatus] = useState<"ALL" | OrderStatus>("ALL");
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    ordered: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);

  // 페이징 및 검색 상태값
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchProduct, setSearchProduct] = useState("");

  // 정렬 상태
  const [sortBy, setSortBy] = useState<"orderDate" | "totalPrice">("orderDate");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const handleSortToggle = (field: "orderDate" | "totalPrice") => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
    setPage(0);
  };

  // 전체 주문 상태별 누적 개수 집계
  const fetchStatusCounts = async () => {
    try {
      const res = await fetch(`${ORDERS_API}?page=0&size=1000`);
      if (res.ok) {
        const data = await res.json();
        const all: Order[] = data.content ?? (Array.isArray(data) ? data : []);
        setStatusCounts({
          total: data.totalElements ?? all.length,
          ordered: all.filter((o) => o.status === "ORDERED").length,
          shipped: all.filter((o) => o.status === "SHIPPED").length,
          delivered: all.filter((o) => o.status === "DELIVERED").length,
          cancelled: all.filter((o) => o.status === "CANCELLED").length,
        });
      }
    } catch (e) {
      console.error("상태 카운트 조회 실패:", e);
    }
  };

  useEffect(() => {
    fetchStatusCounts();
  }, []);

  // 이메일 검색, 상품명 검색, 날짜, 주문 상태, 동적 정렬 복합 조건 주문 목록 조회
  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      let url = ORDERS_API;
      if (filterMode === "TODAY") {
        url = `${ORDERS_API}/today-deliveries`;
      } else if (filterMode === "DATE") {
        url = `${ORDERS_API}/today-deliveries?date=${selectedDate}`;
      } else {
        url = `${ORDERS_API}?page=${page}&size=10&sort=${sortBy},${sortDir}`;
        if (searchEmail.trim()) {
          url += `&email=${encodeURIComponent(searchEmail.trim())}`;
        }
        if (searchProduct.trim()) {
          url += `&productName=${encodeURIComponent(searchProduct.trim())}`;
        }
        if (selectedStatus !== "ALL") {
          url += `&status=${selectedStatus}`;
        }
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("주문 목록을 불러오지 못했습니다.");
      }
      const data = await response.json();
      if (data.content && Array.isArray(data.content)) {
        setOrders(data.content);
        setTotalPages(data.totalPages ?? 0);
        setTotalElements(data.totalElements ?? 0);
      } else if (Array.isArray(data)) {
        let filtered = data;
        if (searchEmail.trim()) {
          filtered = filtered.filter((item: Order) =>
            item.email.toLowerCase().includes(searchEmail.trim().toLowerCase())
          );
        }
        if (searchProduct.trim()) {
          const productQuery = searchProduct.trim().toLowerCase();
          filtered = filtered.filter((item: Order) =>
            item.orderItems?.some((oi) =>
              oi.productName.toLowerCase().includes(productQuery)
            )
          );
        }
        if (selectedStatus !== "ALL") {
          filtered = filtered.filter((item: Order) => item.status === selectedStatus);
        }
        filtered.sort((a: Order, b: Order) => {
          if (sortBy === "orderDate") {
            const timeA = new Date(a.orderDate).getTime();
            const timeB = new Date(b.orderDate).getTime();
            return sortDir === "desc" ? timeB - timeA : timeA - timeB;
          } else if (sortBy === "totalPrice") {
            return sortDir === "desc"
              ? b.totalPrice - a.totalPrice
              : a.totalPrice - b.totalPrice;
          }
          return 0;
        });
        setOrders(filtered);
        setTotalPages(1);
        setTotalElements(filtered.length);
      } else {
        setOrders([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("주문 조회 실패:", error);
      setError("주문 목록을 불러오지 못했습니다.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [
    filterMode,
    selectedDate,
    page,
    searchEmail,
    searchProduct,
    selectedStatus,
    sortBy,
    sortDir,
  ]);

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

  // 주문 상태 변경 (PUT /api/v1/admin/orders/{id}/status)
  const handleStatusChange = async (
    orderId: number,
    nextStatus: OrderStatus,
  ) => {
    const label = ORDER_STATUS_LABEL[nextStatus];
    if (
      !window.confirm(
        `주문 #${orderId}의 상태를 [${label}](으)로 변경하시겠습니까?`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${ORDERS_API}/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        throw new Error("상태 변경 실패");
      }

      const updatedOrder: Order = await response.json();

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updatedOrder : o)),
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder);
      }

      fetchStatusCounts();
      alert(`주문 상태가 [${label}](으)로 변경되었습니다.`);
    } catch (error) {
      console.error("상태 변경 실패:", error);
      alert("주문 상태 변경에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-[85vh] space-y-7">
      {/* 페이지 상단 헤더 및 필터 바 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-[#9A7655]">ORDERS</p>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            주문 관리
          </h1>
        </div>

        <OrderFilterBar
          searchEmail={searchEmail}
          onSearchEmailChange={(email) => {
            setSearchEmail(email);
            setPage(0);
          }}
          searchProduct={searchProduct}
          onSearchProductChange={(product) => {
            setSearchProduct(product);
            setPage(0);
          }}
          filterMode={filterMode}
          onFilterModeChange={(mode) => {
            setFilterMode(mode);
            setPage(0);
          }}
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setPage(0);
          }}
          onResetFilters={() => {
            setSearchEmail("");
            setSearchProduct("");
            setFilterMode("ALL");
            setSelectedStatus("ALL");
            setPage(0);
          }}
        />
      </div>

      {/* 주문 상태 필터 카드 5종 */}
      <OrderStatusFilterCards
        selectedStatus={selectedStatus}
        onSelectStatus={(status) => {
          setSelectedStatus(status);
          setPage(0);
        }}
        statusCounts={statusCounts}
      />

      {/* 에러 메시지 */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* 주문 목록 테이블 및 페이징 */}
      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
          <div>
            <h2 className="font-semibold text-neutral-900">주문 목록</h2>
            <p className="mt-1 text-sm text-neutral-400">
              총 {loading ? "-" : totalElements}건의 주문
            </p>
          </div>
        </div>

        <OrderTable
          orders={orders}
          page={page}
          error={error}
          sortBy={sortBy}
          sortDir={sortDir}
          onSortToggle={handleSortToggle}
          selectedOrder={selectedOrder}
          onToggleSelectOrder={(orderId) => {
            if (selectedOrder?.id === orderId) {
              setSelectedOrder(null);
            } else {
              handleSelectOrder(orderId);
            }
          }}
          onStatusChange={handleStatusChange}
          detailLoading={detailLoading}
          detailError={detailError}
          onCloseDetail={() => setSelectedOrder(null)}
        />

        {/* 서버 사이드 페이징 컨트롤러 */}
        {filterMode === "ALL" && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </section>
    </div>
  );
}
