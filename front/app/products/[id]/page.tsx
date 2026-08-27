'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
    id: number;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
};

export default function ProductDetailPage() {
    const { id } = useParams();

    const [product, setProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/products/${id}`)
            .then((response) => response.json())
            .then((data) => {
                setProduct(data);
            });
    }, [id]);

    if (product === null) {
        return <div className="py-20 text-center text-neutral-500">로딩중...</div>;
    }

    return (
        <main className="max-w-5xl mx-auto px-6 lg:px-12 py-10 space-y-8">
            {/* 상단 네비게이션 및 주문 확인하기 버튼 */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <Link
                    href="/products"
                    className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition flex items-center gap-1"
                >
                    ← 상품 목록으로 돌아가기
                </Link>
                <Link
                    href="/orders"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50 hover:border-neutral-300"
                >
                    <span>▤</span>
                    주문 확인하기
                </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-12 pt-2">
                <div className="bg-neutral-900 rounded-2xl overflow-hidden shadow-sm">
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div>
                    <h1 className="text-4xl font-semibold !text-black">
                        {product.name}
                    </h1>

                    <p className="text-2xl font-medium !text-black mt-6">
                        {product.price.toLocaleString("ko-KR")}원
                    </p>

                    <p className="text-lg text-neutral-600 mt-12 leading-8">
                        {product.description}
                    </p>
                </div>
            </div>
        </main>
    );
}