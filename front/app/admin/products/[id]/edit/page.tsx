"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] =
    useState("");
  const [imageUrl, setImageUrl] =
    useState("");

  const [isActive, setIsActive] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  // 기존 상품 조회
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/products/${id}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "상품 조회 실패"
          );
        }

        const product: Product =
          await response.json();

        setName(product.name);
        setPrice(String(product.price));
        setDescription(
          product.description ?? ""
        );
        setImageUrl(
          product.imageUrl ?? ""
        );
        setIsActive(product.isActive);
      } catch (error) {
        console.error(
          "상품 조회 실패:",
          error
        );

        setError(
          "상품 정보를 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  // 상품 수정
  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        `/api/admin/products/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            price: Number(price),
            description,
            imageUrl:
              imageUrl.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "상품 수정 실패"
        );
      }

      alert(
        "상품이 수정되었습니다."
      );

      router.push(
        "/admin/products"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "상품 수정 실패:",
        error
      );

      setError(
        "상품 수정에 실패했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 로딩
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-[#A77A52]" />

          <p className="mt-4 text-sm text-neutral-400">
            상품 정보를 불러오는 중입니다.
          </p>
        </div>
      </div>
    );
  }

  // 조회 실패
  if (error && !name) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-400">
            !
          </div>

          <p className="mt-4 text-sm font-medium text-neutral-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/products"
              )
            }
            className="mt-5 cursor-pointer rounded-xl bg-[#1F1B18] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#342D28]"
          >
            상품 목록으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* 페이지 상단 */}
      <div>
        <p className="mb-2 text-sm font-medium text-[#9A7655]">
          PRODUCTS
        </p>

        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            상품 수정
          </h1>

          {/* 상품 상태 */}
          {isActive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              판매중
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-500">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              판매중단
            </span>
          )}
        </div>

        <p className="mt-2 text-sm text-neutral-500">
          등록된 상품 정보를 수정할 수
          있습니다.
        </p>
      </div>

      {/* 에러 */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* 수정 폼 */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
      >
        {/* 폼 헤더 */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-7 py-5">
          <div>
            <h2 className="font-semibold text-neutral-900">
              상품 정보
            </h2>

            <p className="mt-1 text-sm text-neutral-400">
              변경할 상품 정보를
              입력해주세요.
            </p>
          </div>

          <span className="rounded-lg bg-[#F5EEE7] px-3 py-1.5 text-xs font-semibold text-[#8A684A]">
            ID #{id}
          </span>
        </div>

        <div className="space-y-7 p-7">
          {/* 상품명 */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold text-neutral-700"
            >
              상품명
              <span className="ml-1 text-[#A77A52]">
                *
              </span>
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#A77A52] focus:ring-2 focus:ring-[#A77A52]/10"
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
              <span className="ml-1 text-[#A77A52]">
                *
              </span>
            </label>

            <div className="relative">
              <input
                id="price"
                type="number"
                min="0"
                value={price}
                onChange={(e) =>
                  setPrice(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 pr-12 text-sm text-neutral-900 outline-none transition focus:border-[#A77A52] focus:ring-2 focus:ring-[#A77A52]/10"
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
              <span className="ml-1 text-[#A77A52]">
                *
              </span>
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              rows={6}
              className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition focus:border-[#A77A52] focus:ring-2 focus:ring-[#A77A52]/10"
              required
            />
          </div>

          {/* 상품 이미지 */}
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
                  onChange={(e) =>
                    setImageUrl(
                      e.target.value
                    )
                  }
                  placeholder="americano.jpg"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-[#A77A52] focus:ring-2 focus:ring-[#A77A52]/10"
                />

                <p className="mt-2 text-xs text-neutral-400">
                  변경할 상품 이미지
                  경로를 입력해주세요.
                </p>
              </div>

              {/* 이미지 미리보기 */}
              <div className="flex h-36 items-center justify-center overflow-hidden rounded-xl border border-dashed border-neutral-300 bg-[#FAFAF9]">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={
                      name ||
                      "상품 이미지"
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-300">
                      ◇
                    </div>

                    <p className="mt-2 text-xs text-neutral-400">
                      등록된 이미지 없음
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
            onClick={() =>
              router.push(
                "/admin/products"
              )
            }
            disabled={submitting}
            className="cursor-pointer rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            취소
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer rounded-xl bg-[#1F1B18] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#342D28] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "수정 중..."
              : "수정 완료"}
          </button>
        </div>
      </form>
    </div>
  );
}