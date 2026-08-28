"use client";

import CalendarDropdown from "@/components/common/CalendarDropdown";

interface OrderFilterBarProps {
  searchEmail: string;
  onSearchEmailChange: (email: string) => void;
  searchProduct: string;
  onSearchProductChange: (product: string) => void;
  filterMode: "ALL" | "TODAY" | "DATE";
  onFilterModeChange: (mode: "ALL" | "TODAY" | "DATE") => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onResetFilters: () => void;
}

export default function OrderFilterBar({
  searchEmail,
  onSearchEmailChange,
  searchProduct,
  onSearchProductChange,
  filterMode,
  onFilterModeChange,
  selectedDate,
  onSelectDate,
  onResetFilters,
}: OrderFilterBarProps) {
  const hasActiveFilters =
    Boolean(searchEmail.trim()) ||
    Boolean(searchProduct.trim()) ||
    filterMode !== "ALL";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm">
      {/* 이메일 검색창 */}
      <input
        type="text"
        value={searchEmail}
        onChange={(e) => onSearchEmailChange(e.target.value)}
        placeholder="고객 이메일 검색..."
        className="rounded-xl border border-neutral-200 bg-[#FAFAF9] px-3.5 py-1.5 text-xs text-neutral-800 placeholder-neutral-400 outline-none transition focus:border-[#A77A52] focus:bg-white focus:ring-2 focus:ring-[#A77A52]/20"
      />

      {/* 상품명 검색창 */}
      <input
        type="text"
        value={searchProduct}
        onChange={(e) => onSearchProductChange(e.target.value)}
        placeholder="주문 상품명 검색..."
        className="rounded-xl border border-neutral-200 bg-[#FAFAF9] px-3.5 py-1.5 text-xs text-neutral-800 placeholder-neutral-400 outline-none transition focus:border-[#A77A52] focus:bg-white focus:ring-2 focus:ring-[#A77A52]/20"
      />

      {/* 전체 주문 버튼 */}
      <button
        type="button"
        onClick={() => onFilterModeChange("ALL")}
        className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
          filterMode === "ALL"
            ? "bg-[#1D1916] text-white"
            : "text-neutral-600 hover:bg-neutral-100"
        }`}
      >
        전체 주문
      </button>

      {/* 오늘 배송 대상 버튼 */}
      <button
        type="button"
        onClick={() => onFilterModeChange("TODAY")}
        className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
          filterMode === "TODAY"
            ? "bg-[#A77A52] text-white"
            : "text-neutral-600 hover:bg-neutral-100"
        }`}
      >
        오늘 배송 대상
      </button>

      {/* 캘린더 드롭다운 */}
      <CalendarDropdown
        selectedDate={selectedDate}
        onSelectDate={(date) => {
          onSelectDate(date);
          onFilterModeChange("DATE");
        }}
        labelPrefix="배송일:"
        isActive={filterMode === "DATE"}
      />

      {/* 필터 초기화 버튼 */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="rounded-xl px-3 py-1.5 text-xs font-medium text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
          title="검색 조건 초기화"
        >
          초기화 ↺
        </button>
      )}
    </div>
  );
}
