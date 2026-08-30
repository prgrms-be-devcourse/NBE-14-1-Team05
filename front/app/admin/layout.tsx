"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const menus = [
  {
    name: "대시보드",
    href: "/admin",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </svg>
    ),
  },
  {
    name: "상품 관리",
    href: "/admin/products",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <path d="M6 7.5 12 4l6 3.5v9L12 20l-6-3.5z" />
        <path d="M6 7.5 12 11l6-3.5" />
        <path d="M12 11v9" />
      </svg>
    ),
  },
  {
    name: "주문 관리",
    href: "/admin/orders",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <path d="M6 4h12v16H6z" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
        <path d="M9 16h4" />
      </svg>
    ),
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/admin/login";

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      const backendBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

      await Promise.allSettled([
        fetch("/api/admin/auth/logout", {
          method: "POST",
        }),
        fetch(`${backendBaseUrl}/api/v1/admin/auth/logout`, {
          method: "POST",
          credentials: "include",
        }),
      ]);

      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("관리자 로그아웃 실패:", error);
      alert("로그아웃에 실패했습니다.");
    }
  };

  // 로그인 페이지에서는 관리자 레이아웃을 보여주지 않음
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#F8F7F4]">
      {/* 사이드바 */}
      <aside className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col bg-[#1D1916] px-4 py-6 text-white">
        {/* 브랜드 */}
        <div className="px-4 pb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A77A52] font-bold text-white">
              C
            </div>

            <div>
              <h1 className="text-base font-bold tracking-wide">
                COFFEE ADMIN
              </h1>

              <p className="mt-0.5 text-[11px] text-neutral-500">
                Management System
              </p>
            </div>
          </div>
        </div>

        {/* 메뉴 */}
        <div className="flex-1">
          <p className="mb-3 px-4 text-[10px] font-semibold tracking-[0.18em] text-neutral-600">
            MANAGEMENT
          </p>

          <nav className="space-y-1.5">
            {menus.map((menu) => {
              const active = isActive(menu.href);

              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all ${
                    active
                      ? "bg-[#A77A52] font-semibold text-white shadow-sm"
                      : "font-medium text-neutral-400 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <span
                    className={`transition ${
                      active
                        ? "text-white"
                        : "text-neutral-500 group-hover:text-neutral-300"
                    }`}
                  >
                    {menu.icon}
                  </span>

                  <span>{menu.name}</span>

                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/80" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 하단 */}
        <div className="border-t border-white/[0.08] pt-4">
          {/* 쇼핑몰 이동 */}
          <Link
            href="/products"
            className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-neutral-500 transition hover:bg-white/[0.06] hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>

            쇼핑몰로 돌아가기
          </Link>

          {/* 관리자 프로필 */}
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#A77A52] text-sm font-bold">
              A
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-neutral-200">
                관리자
              </p>

              <p className="truncate text-[11px] text-neutral-600">
                Administrator
              </p>
            </div>

            {/* 로그아웃 버튼 */}
            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer rounded-lg px-2 py-2 text-xs font-medium text-neutral-500 transition hover:bg-white/[0.06] hover:text-white"
            >
              로그아웃
            </button>
          </div>
        </div>
      </aside>

      {/* 콘텐츠 */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-[1440px]">
          {children}
        </div>
      </main>
    </div>
  );
}