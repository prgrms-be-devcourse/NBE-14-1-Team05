/**
 * 숫자를 한국 원화 표기(천 단위 구분 쉼표 + "원")로 변환
 */
export function formatKRW(n: number): string {
  return `${n.toLocaleString("ko-KR")}원`;
}

/**
 * 숫자를 천 단위 구분 쉼표 포맷으로 변환 (숫자만)
 */
export function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR");
}

/**
 * 주문일시 등의 ISO 일시 문자열을 한국어 표준 일시로 변환
 * 예: "2026. 8. 27. 오후 12:31:59"
 */
export function formatDateTime(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ko-KR");
}

/**
 * 배송일자 등의 날짜 문자열을 한국어 표준 날짜로 변환 (일자까지)
 * 예: "2026. 8. 27."
 */
export function formatDeliveryDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("ko-KR");
}

/**
 * "YYYY-MM-DD" 형태의 일별 문자열을 한국어 형식으로 변환
 * 예: "2026년 8월 27일"
 */
export function formatDailyDate(dateStr: string): string {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[0]}년 ${parseInt(parts[1], 10)}월 ${parseInt(parts[2], 10)}일`;
  }
  return dateStr;
}

/**
 * "YYYY-MM" 형태의 월별 문자열을 한국어 형식으로 변환
 * 예: "2026년 8월"
 */
export function formatMonthlyDate(ymStr: string): string {
  if (!ymStr) return "-";
  const parts = ymStr.split("-");
  if (parts.length === 2) {
    return `${parts[0]}년 ${parseInt(parts[1], 10)}월`;
  }
  return ymStr;
}

/**
 * 연, 월, 일을 "YYYY-MM-DD" 포맷 문자열로 변환
 */
export function formatDateStr(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

