package com.back.nbe141team5.product.dto;

import com.back.nbe141team5.product.entity.Product;

import java.time.LocalDateTime;

public record AdminProductResponse(
        Long id,
        String name,
        Integer price,
        String description,
        String imageUrl,
        boolean isActive,
        LocalDateTime createdDate,
        LocalDateTime updatedDate
) {

    public static AdminProductResponse from(Product product) {
        return new AdminProductResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getDescription(),
                product.getImageUrl(),
                product.isActive(),
                product.getCreatedDate(),
                product.getUpdatedDate()
        );
    }
}

/*
[관리자 상품 응답 DTO]

1. 관리자 상품 등록/수정 API에서 사용
2. 고객용 ProductResponse와 역할 분리
3. 관리자에게 필요한 isActive, createdDate, updatedDate 포함
*/