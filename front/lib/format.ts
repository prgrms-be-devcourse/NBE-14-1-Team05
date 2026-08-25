/**
 * 숫자를 한국 원화 표기(천 단위 구분 쉼표 + "원")로 변환
 */
export function formatKRW(n: number) {
    return n.toLocaleString("ko-KR") + "원";
}
