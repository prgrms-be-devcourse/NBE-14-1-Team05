"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        price: Number(price),
        description,
        imageUrl: imageUrl || null,
      }),
    });

    if (!response.ok) {
      alert("상품 등록에 실패했습니다.");
      return;
    }

    alert("상품이 등록되었습니다.");

    router.push("/admin/products");
    router.refresh();
  };

  return (
    <div className="space-y-7">
      {/* 페이지 상단 */}
      <div>
        <p className="mb-2 text-sm font-medium text-[#9A7655]">
          PRODUCTS
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          새 상품 등록
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          새로운 상품 정보를 입력하고 상품을 등록할 수 있습니다.
        </p>
      </div>

      {/* 등록 폼 */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
      >
        {/* 폼 헤더 */}
        <div className="border-b border-neutral-100 px-7 py-5">
          <h2 className="font-semibold text-neutral-900">
            상품 정보
          </h2>

          <p className="mt-1 text-sm text-neutral-400">
            판매할 상품의 기본 정보를 입력해주세요.
          </p>
        </div>

        <div className="space-y-7 p-7">
          {/* 상품명 */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold text-neutral-700"
            >
              상품명
              <span className="ml-1 text-[#A77A52]">*</span>
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="상품명을 입력해주세요."
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-[#A77A52] focus:ring-2 focus:ring-[#A77A52]/10"
              required
            />
          </div>

          {/* 가격 */}
          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-semibold text-neutral-700"
            >
              가격
              <span className="ml-1 text-[#A77A52]">*</span>
            </label>

            <div className="relative">
              <input
                id="price"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 pr-12 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-[#A77A52] focus:ring-2 focus:ring-[#A77A52]/10"
                required
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                원
              </span>
            </div>
          </div>

          {/* 설명 */}
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold text-neutral-700"
            >
              상품 설명
              <span className="ml-1 text-[#A77A52]">*</span>
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상품에 대한 설명을 입력해주세요."
              rows={6}
              className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-[#A77A52] focus:ring-2 focus:ring-[#A77A52]/10"
              required
            />
          </div>

          {/* 이미지 */}
          <div>
            <label
              htmlFor="imageUrl"
              className="mb-2 block text-sm font-semibold text-neutral-700"
            >
              상품 이미지
            </label>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_160px]">
              <div>
                <input
                  id="imageUrl"
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="americano.jpg"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-[#A77A52] focus:ring-2 focus:ring-[#A77A52]/10"
                />

                <p className="mt-2 text-xs text-neutral-400">
                  등록할 상품 이미지 경로를 입력해주세요.
                </p>
              </div>

              {/* 이미지 미리보기 */}
              <div className="flex h-36 items-center justify-center overflow-hidden rounded-xl border border-dashed border-neutral-300 bg-[#FAFAF9]">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="상품 미리보기"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-300">
                      ◇
                    </div>

                    <p className="mt-2 text-xs text-neutral-400">
                      이미지 미리보기
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center justify-end gap-3 border-t border-neutral-100 bg-[#FAFAF9] px-7 py-5">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="cursor-pointer rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50"
          >
            취소
          </button>

          <button
            type="submit"
            className="cursor-pointer rounded-xl bg-[#1F1B18] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#342D28]"
          >
            상품 등록
          </button>
        </div>
      </form>
    </div>
  );
}