import { type TopProduct } from "@/types/stats";
import { formatPrice } from "@/lib/format";

interface TopRankingSectionProps {
  topQuantityProducts?: TopProduct[];
  topRevenueProducts?: TopProduct[];
}

export default function TopRankingSection({
  topQuantityProducts = [],
  topRevenueProducts = [],
}: TopRankingSectionProps) {
  const maxQty = topQuantityProducts[0]?.quantity || 1;
  const maxRev = topRevenueProducts[0]?.revenue || 1;

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 판매 수량 TOP 3 */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              판매 수량 TOP 3
            </h2>
          </div>
          <span className="rounded-lg bg-[#FAF7F3] px-2.5 py-1 text-xs font-medium text-[#8A684A]">
            수량 기준
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {topQuantityProducts.length > 0 ? (
            topQuantityProducts.map((item, idx) => {
              const percent = Math.round((item.quantity / maxQty) * 100);
              return (
                <div key={item.productName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                          idx === 0
                            ? "bg-[#1D1916] text-white"
                            : idx === 1
                              ? "bg-[#8A684A] text-white"
                              : "bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-neutral-800">
                        {item.productName}
                      </span>
                    </div>
                    <span className="font-bold text-neutral-900">
                      {item.quantity.toLocaleString("ko-KR")}개
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0
                          ? "bg-[#1D1916]"
                          : idx === 1
                            ? "bg-[#8A684A]"
                            : "bg-neutral-400"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="py-6 text-center text-sm text-neutral-400">
              집계된 판매 데이터가 없습니다.
            </p>
          )}
        </div>
      </div>

      {/* 매출액 TOP 3 */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              매출액 TOP 3
            </h2>
          </div>
          <span className="rounded-lg bg-[#FAF7F3] px-2.5 py-1 text-xs font-medium text-[#8A684A]">
            매출 기준
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {topRevenueProducts.length > 0 ? (
            topRevenueProducts.map((item, idx) => {
              const percent = Math.round((item.revenue / maxRev) * 100);
              return (
                <div key={item.productName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                          idx === 0
                            ? "bg-[#1D1916] text-white"
                            : idx === 1
                              ? "bg-[#8A684A] text-white"
                              : "bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-neutral-800">
                        {item.productName}
                      </span>
                    </div>
                    <span className="font-bold text-neutral-900">
                      {formatPrice(item.revenue)}원
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0
                          ? "bg-[#1D1916]"
                          : idx === 1
                            ? "bg-[#8A684A]"
                            : "bg-neutral-400"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="py-6 text-center text-sm text-neutral-400">
              집계된 매출 데이터가 없습니다.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
