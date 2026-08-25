// 일단 고객 입장에서의 상품 목록, 조회 화면에 적용될 레이아웃

export default function ProductsLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="min-h-screen bg-[#F7F6F3]">
  
        <div className="px-6 lg:px-12 py-6 border-b border-neutral-200">
          <h2 className="text-xl font-semibold">
            Coffee Products
          </h2>
        </div>
  
        {children}
  
      </div>
    );
  }