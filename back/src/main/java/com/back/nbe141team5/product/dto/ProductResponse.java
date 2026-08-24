package com.back.nbe141team5.product.dto;

import com.back.nbe141team5.product.entity.Product;

public record ProductResponse(
        Long id,
        String name,
        Integer price,
        String description,
        String imageUrl
) {
    //고객 화면에서 필요한 값만 반응
    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getDescription(),
                product.getImageUrl()
        );
    }
}
