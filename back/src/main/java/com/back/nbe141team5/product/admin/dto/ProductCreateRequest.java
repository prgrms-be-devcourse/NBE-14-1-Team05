package com.back.nbe141team5.product.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ProductCreateRequest(

        @NotBlank(message = "상품명은 필수입니다.")
        String name,

        @NotNull(message = "가격은 필수입니다.")
        @Positive(message = "가격은 0보다 커야 합니다.")
        Integer price,

        String description,

        String imageUrl
) {
}

/*
[Rebase 수정 내용]

1. image -> imageUrl로 변경
2. Product Entity 및 ProductService의 필드명과 통일
*/