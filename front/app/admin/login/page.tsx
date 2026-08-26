"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminCode,
        }),
      });

      if (!response.ok) {
        setError("관리자 코드가 올바르지 않습니다.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("관리자 인증 실패:", error);
      setError("관리자 인증 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F4F0] px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-semibold tracking-wider text-[#9A7655]">
              ADMIN
            </p>

            <h1 className="text-2xl font-bold text-neutral-900">
              관리자 인증
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              관리자 코드를 입력해주세요.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="adminCode"
                className="mb-2 block text-sm font-semibold text-neutral-700"
              >
                관리자 코드
              </label>

              <input
                id="adminCode"
                type="password"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                placeholder="관리자 코드를 입력하세요"
                autoComplete="off"
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-[#A77A52] focus:ring-2 focus:ring-[#A77A52]/10"
                required
              />

              {error && (
                <p className="mt-2 text-sm text-red-500">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-xl bg-[#1F1B18] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#342D28] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "인증 중..." : "관리자 페이지 들어가기"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => router.push("/products")}
            className="mt-4 w-full cursor-pointer py-2 text-sm font-medium text-neutral-400 transition hover:text-neutral-700"
          >
            쇼핑몰로 돌아가기
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-neutral-400">
          관리자 전용 페이지입니다.
        </p>
      </div>
    </main>
  );
}