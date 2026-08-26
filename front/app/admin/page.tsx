"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 대시보드 데이터 조회
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 상품 개수 조회
        const productResponse = await fetch("/api/admin/products");

        if (!productResponse.ok) {
          throw new Error("상품 조회 실패");
        }

        const products = await productResponse.json();

        setProductCount(products.totalElements);

        // 주문 개수 조회
        const orderResponse = await fetch(
          "http://localhost:8080/api/v1/orders"
        );

        if (!orderResponse.ok) {
          throw new Error("주문 조회 실패");
        }

        const orders = await orderResponse.json();

        setOrderCount(orders.length);
      } catch (error) {
        console.error("대시보드 데이터 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-10">
      {/* 상단 */}
      <div>
        <p className="mb-2 text-sm font-medium text-neutral-500">
          ADMIN
        </p>

        <h1 className="text-3xl font-bold tracking-tight">
          관리자 대시보드
        </h1>

        <p className="mt-2 text-neutral-500">
          서비스 현황을 확인하고 주요 기능을 관리할 수 있습니다.
        </p>
      </div>

      {/* 서비스 현황 */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          서비스 현황
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* 상품 */}
          <Link
            href="/admin/products"
            className="group rounded-xl border border-neutral-200 bg-white p-6 transition hover:border-neutral-400 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">
                  등록 상품
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {loading ? "-" : productCount}

                  {!loading && (
                    <span className="ml-1 text-lg font-medium">
                      개
                    </span>
                  )}
                </p>
              </div>

              <span className="text-neutral-400 transition group-hover:translate-x-1">
                →
              </span>
            </div>

            <p className="mt-4 text-sm text-neutral-400">
              현재 등록된 전체 상품
            </p>
          </Link>

          {/* 주문 */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <p className="text-sm font-medium text-neutral-500">
              전체 주문
            </p>

            <p className="mt-3 text-3xl font-bold">
              {loading ? "-" : orderCount}

              {!loading && (
                <span className="ml-1 text-lg font-medium">
                  건
                </span>
              )}
            </p>

            <p className="mt-4 text-sm text-neutral-400">
              현재 접수된 전체 주문
            </p>
          </div>

          {/* 회원 */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <p className="text-sm font-medium text-neutral-500">
              회원
            </p>

            <p className="mt-3 text-2xl font-semibold text-neutral-400">
              준비 중
            </p>

            <p className="mt-4 text-sm text-neutral-400">
              회원 기능 구현 후 연동 예정
            </p>
          </div>
        </div>
      </section>

      {/* 빠른 관리 */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            빠른 관리
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            자주 사용하는 관리자 기능입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* 상품 관리 */}
          <Link
            href="/admin/products"
            className="group flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-6 transition hover:border-neutral-400 hover:shadow-sm"
          >
            <div>
              <h3 className="font-semibold">
                상품 관리
              </h3>

              <p className="mt-2 text-sm text-neutral-500">
                등록된 상품을 조회하고 수정하거나 삭제합니다.
              </p>
            </div>

            <span className="ml-4 text-xl text-neutral-400 transition group-hover:translate-x-1">
              →
            </span>
          </Link>

          {/* 상품 등록 */}
          <Link
            href="/admin/products/new"
            className="group flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-6 transition hover:border-neutral-400 hover:shadow-sm"
          >
            <div>
              <h3 className="font-semibold">
                새 상품 등록
              </h3>

              <p className="mt-2 text-sm text-neutral-500">
                새로운 상품 정보를 등록합니다.
              </p>
            </div>

            <span className="ml-4 text-xl text-neutral-400 transition group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}