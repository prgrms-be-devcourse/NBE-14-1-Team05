"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);

  // 수정 페이지가 열리면 기존 상품 정보 조회
  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("상품 조회 실패");
        }

        return response.json();
      })
      .then((product: Product) => {
        setName(product.name);
        setPrice(String(product.price));
        setDescription(product.description);
        setImageUrl(product.imageUrl ?? "");
      })
      .catch((error) => {
        console.error("상품 조회 실패:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // 수정 완료 버튼
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
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
      alert("상품 수정에 실패했습니다.");
      return;
    }

    alert("상품이 수정되었습니다.");

    router.push("/admin/products");
    router.refresh();
  };

  if (loading) {
    return <p>상품 정보를 불러오는 중...</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-semibold mb-2">상품 수정</h1>

      <p className="text-neutral-500 mb-8">
        상품 ID: {id}
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-neutral-200 rounded-lg p-6"
      >
        <div className="mb-5">
          <label className="block mb-2 font-medium">상품명</label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-neutral-300 rounded px-4 py-3"
            required
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 font-medium">가격</label>

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-neutral-300 rounded px-4 py-3"
            required
          />
        </div>

        <div className="mb-5">
          <label className="block mb-2 font-medium">설명</label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-neutral-300 rounded px-4 py-3"
            rows={4}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium">이미지 URL</label>

          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full border border-neutral-300 rounded px-4 py-3"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-black text-white px-5 py-3 rounded"
          >
            수정 완료
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