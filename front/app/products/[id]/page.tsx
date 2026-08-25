'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
        return <div>로딩중...</div>;
    }

    return (
        <main className="max-w-5xl mx-auto px-6 lg:px-12 py-12">
            <div className="grid md:grid-cols-2 gap-12">
                <div className="bg-neutral-900 rounded overflow-hidden">
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full"
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