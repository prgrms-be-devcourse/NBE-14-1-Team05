package com.back.nbe141team5.product.dto;

import com.back.nbe141team5.product.entity.Product;

public record ProductResponse(
        Long id,
        String name,
        Integer price,
        String description,
        String imageUrl
) {

    // 고객 화면에서 필요한 값만 응답
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

/*
[Rebase Conflict 해결 내용]

1. main의 고객용 ProductResponse 구조 유지
   - id
   - name
   - price
   - description
   - imageUrl

2. image 대신 imageUrl 사용
   - Product Entity의 필드명과 통일

3. 관리자에서 필요한
   isActive, createdDate, updatedDate는 ProductResponse에서 제거

4. 관리자용 응답 정보는 별도의
   AdminProductResponse에서 처리

5. LocalDateTime을 사용하지 않으므로 import 제거
*/