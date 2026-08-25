import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F7F6F3]">
      <aside className="w-64 border-r border-neutral-200 p-6">
        <h1 className="text-xl font-semibold mb-10">
          ADMIN
        </h1>

        <nav className="flex flex-col gap-4">
          <Link href="/admin">
            대시보드
          </Link>

          <Link href="/admin/products">
            상품 관리
          </Link>

          <Link href="/">
            쇼핑몰로 돌아가기
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  );
}