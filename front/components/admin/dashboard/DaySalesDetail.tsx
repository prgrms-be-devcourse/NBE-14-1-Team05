import { formatDailyDate, formatPrice } from "@/lib/format";

interface CustomProductItem {
  productName: string;
  quantity: number;
  revenue: number;
}

interface DaySalesDetailProps {
  salesTab: "TODAY" | "CUSTOM";
  selectedSalesDate: string;
  customLoading: boolean;
  customTotalRevenue: number;
  customOrderCount: number;
  customAov: number;
  customProductList: CustomProductItem[];
}

export default function DaySalesDetail({
  salesTab,
  selectedSalesDate,
  customLoading,
  customTotalRevenue,
  customOrderCount,
  customAov,
  customProductList,
}: DaySalesDetailProps) {
  return (
    <div className="p-6 space-y-6">
      {/* 3대 핵심 KPI 통계 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-[#FAFAF9] p-4">
          <p className="text-xs font-medium text-neutral-500">당일 결제 매출</p>
          <p className="mt-2 text-xl font-bold text-neutral-900">
            {customLoading ? "-" : `${formatPrice(customTotalRevenue)}원`}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-[#FAFAF9] p-4">
          <p className="text-xs font-medium text-neutral-500">정상 주문 건수</p>
          <p className="mt-2 text-xl font-bold text-neutral-900">
            {customLoading ? "-" : `${customOrderCount}건`}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-[#FAFAF9] p-4">
          <p className="text-xs font-medium text-neutral-500">건당 평균 결제액</p>
          <p className="mt-2 text-xl font-bold text-[#8A684A]">
            {customLoading ? "-" : `${formatPrice(customAov)}원`}
          </p>
        </div>
      </div>

      {/* 상품별 판매 기여도 테이블 */}
      <div>
        <h3 className="mb-3 text-xs font-bold text-neutral-700">
          {salesTab === "TODAY"
            ? "오늘"
            : formatDailyDate(selectedSalesDate)}{" "}
          판매 상품별 기여도
        </h3>
        <div className="overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="bg-[#FAFAF9] text-left text-xs font-semibold text-neutral-500">
                <th className="px-6 py-3">판매 상품</th>
                <th className="w-28 px-4 py-3 text-center">판매 수량</th>
                <th className="w-40 px-6 py-3 text-right">판매 금액</th>
                <th className="w-44 px-6 py-3">매출 비중</th>
              </tr>
            </thead>
            <tbody>
              {customLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-sm text-neutral-400"
                  >
                    통계 데이터를 불러오는 중...
                  </td>
                </tr>
              ) : customProductList.length > 0 ? (
                customProductList.map((item) => {
                  const ratio = Math.round(
                    (item.revenue / (customTotalRevenue || 1)) * 100,
                  );
                  return (
                    <tr
                      key={item.productName}
                      className="border-t border-neutral-100 transition hover:bg-[#FCFBF9]"
                    >
                      <td className="px-6 py-3.5 text-sm font-semibold text-neutral-800">
                        {item.productName}
                      </td>
                      <td className="px-4 py-3.5 text-center text-sm font-semibold text-neutral-700">
                        {item.quantity}개
                      </td>
                      <td className="px-6 py-3.5 text-right text-sm font-bold text-neutral-900">
                        {formatPrice(item.revenue)}원
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                            <div
                              className="h-full rounded-full bg-[#8A684A] transition-all duration-300"
                              style={{ width: `${ratio}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-xs text-neutral-400">
                            {ratio}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-sm text-neutral-400"
                  >
                    해당 일자에 판매된 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
