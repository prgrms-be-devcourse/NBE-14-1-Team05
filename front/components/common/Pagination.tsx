"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-neutral-100 px-4 sm:px-6 py-4 ${className}`}
    >
      {totalElements !== undefined ? (
        <p className="text-xs text-neutral-400">
          <span>총 {totalElements}건</span>
          <span className="mx-1.5 opacity-40">·</span>
          <span className="whitespace-nowrap">{page + 1} / {totalPages} 페이지</span>
        </p>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-1 shrink-0 overflow-x-auto">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          className="cursor-pointer whitespace-nowrap rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          이전
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPageChange(i)}
            className={`cursor-pointer whitespace-nowrap h-8 w-8 rounded-lg text-xs font-medium transition ${
              page === i
                ? "bg-neutral-900 text-white"
                : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          disabled={page === totalPages - 1}
          className="cursor-pointer whitespace-nowrap rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          다음
        </button>
      </div>
    </div>
  );
}
