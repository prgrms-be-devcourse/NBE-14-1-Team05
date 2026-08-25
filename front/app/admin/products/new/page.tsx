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
    <div className="max-w-2xl">
      <h1 className="text-3xl font-semibold mb-2">
        상품 등록
      </h1>

      <p className="text-neutral-500 mb-8">
        새로운 상품 정보를 입력해주세요.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-neutral-200 rounded-lg p-6"
      >
        <div className="mb-5">
          <label className="block mb-2 font-medium">
            상품명
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-neutral-300 rounded px-4 py-3"
            required
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 font-medium">
            가격
          </label>

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-neutral-300 rounded px-4 py-3"
            required
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 font-medium">
            설명
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-neutral-300 rounded px-4 py-3"
            rows={4}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium">
            이미지 URL
          </label>

          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full border border-neutral-300 rounded px-4 py-3"
            placeholder="americano.jpg"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-black text-white px-5 py-3 rounded"
          >
            상품 등록
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="border border-neutral-300 px-5 py-3 rounded"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}