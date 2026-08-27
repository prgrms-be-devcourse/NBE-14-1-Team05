"use client";

import { useState } from "react";
import { formatDateStr } from "@/lib/format";

interface CalendarDropdownProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  labelPrefix?: string;
  isActive?: boolean;
}

export default function CalendarDropdown({
  selectedDate,
  onSelectDate,
  labelPrefix = "날짜:",
  isActive = false,
}: CalendarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [calendarView, setCalendarView] = useState(() => {
    const base = selectedDate ? new Date(selectedDate) : new Date();
    const valid = !Number.isNaN(base.getTime()) ? base : new Date();
    return { year: valid.getFullYear(), month: valid.getMonth() };
  });

  const handlePrevMonth = () => {
    setCalendarView((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCalendarView((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const firstDayOfWeek = new Date(
    calendarView.year,
    calendarView.month,
    1,
  ).getDay();

  const daysInMonth = new Date(
    calendarView.year,
    calendarView.month + 1,
    0,
  ).getDate();

  const todayStr = formatDateStr(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  );

  return (
    <div className="relative flex items-center gap-2 border-l border-neutral-200 pl-2">
      {labelPrefix && (
        <span className="text-xs font-medium text-neutral-500">
          {labelPrefix}
        </span>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
          isActive
            ? "border-[#A77A52] bg-[#FAF7F3] font-semibold text-[#8A684A]"
            : "border-neutral-200 bg-[#FAFAF9] text-neutral-700 hover:bg-neutral-100"
        }`}
      >
        <span>{selectedDate}</span>
      </button>

      {isOpen && (
        <>
          {/* 팝업 외부 클릭 시 닫히는 오버레이 */}
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)}
          />

          {/* 캘린더 팝업 카드 */}
          <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
            {/* 월 이동 헤더 */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="cursor-pointer rounded-lg p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
              >
                &lt;
              </button>
              <span className="text-xs font-bold text-neutral-800">
                {calendarView.year}년 {calendarView.month + 1}월
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="cursor-pointer rounded-lg p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
              >
                &gt;
              </button>
            </div>

            {/* 요일 헤더 */}
            <div className="mt-2.5 grid grid-cols-7 text-center text-[11px] font-semibold text-neutral-400">
              <span className="text-red-500">일</span>
              <span>월</span>
              <span>화</span>
              <span>수</span>
              <span>목</span>
              <span>금</span>
              <span className="text-blue-500">토</span>
            </div>

            {/* 날짜 그리드 */}
            <div className="mt-1.5 grid grid-cols-7 gap-y-1 text-center text-xs">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = formatDateStr(
                  calendarView.year,
                  calendarView.month,
                  day,
                );
                const isSelected = selectedDate === dateStr;
                const isToday = todayStr === dateStr;

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => {
                      onSelectDate(dateStr);
                      setIsOpen(false);
                    }}
                    className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-xs font-medium transition mx-auto ${
                      isSelected
                        ? "bg-[#A77A52] font-bold text-white shadow-sm"
                        : isToday
                          ? "border border-[#A77A52] text-[#8A684A] font-bold"
                          : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* 하단 오늘 바로가기 및 닫기 */}
            <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2.5">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setCalendarView({
                    year: now.getFullYear(),
                    month: now.getMonth(),
                  });
                  onSelectDate(todayStr);
                  setIsOpen(false);
                }}
                className="cursor-pointer text-[11px] font-medium text-[#8A684A] hover:underline"
              >
                오늘 ({todayStr})
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="cursor-pointer text-[11px] text-neutral-400 hover:text-neutral-600"
              >
                닫기
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
