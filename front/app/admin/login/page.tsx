"use client";

import { FormEvent, useState } from "react";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function AdminLoginPage() {
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const [nextRes, springRes] = await Promise.all([
        fetch("/api/admin/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            adminCode,
          }),
        }),
        fetch(`${BACKEND_BASE_URL}/api/v1/admin/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            adminCode,
          }),
        }),
      ]);

      if (!nextRes.ok || !springRes.ok) {
        setError("관리자 코드가 올바르지 않습니다.");
        return;
      }

      // 로그인 성공 후 전체 페이지 이동
      // 인증 쿠키가 적용된 상태로 /admin을 새로 요청
      window.location.replace("/admin");
    } catch (error) {
      console.error("관리자 인증 실패:", error);
      setError("관리자 인증 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F7F4] px-6">
      <div className="w-full max-w-md">
        {/* 상단 */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#A77A52] text-lg font-bold text-white">
            C
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            COFFEE ADMIN
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            관리자 코드를 입력해주세요.
          </p>
        </div>

        {/* 로그인 폼 */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm"
        >
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
              disabled={loading}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-[#A77A52] focus:ring-2 focus:ring-[#A77A52]/10 disabled:bg-neutral-50"
              required
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full cursor-pointer rounded-xl bg-[#1F1B18] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#342D28] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "인증 중..." : "관리자 로그인"}
          </button>
        </form>

        {/* 쇼핑몰 이동 */}
        <div className="mt-5 text-center">
          <a
            href="/products"
            className="text-sm text-neutral-400 transition hover:text-neutral-700"
          >
            ← 쇼핑몰로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}