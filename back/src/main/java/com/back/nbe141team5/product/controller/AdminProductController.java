package com.back.nbe141team5.product.controller;

import com.back.nbe141team5.product.dto.AdminProductResponse;
import com.back.nbe141team5.product.dto.ProductCreateRequest;
import com.back.nbe141team5.product.dto.ProductUpdateRequest;
import com.back.nbe141team5.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/products")
public class AdminProductController {

    private final ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminProductResponse createProduct(
            @Valid @RequestBody ProductCreateRequest request
    ) {
        return productService.createProduct(request);
    }

    @PutMapping("/{id}")
    public AdminProductResponse updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request
    ) {
        return productService.updateProduct(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }
}

/*
[Rebase 수정 내용]

1. 관리자 등록/수정 반환 타입
   ProductResponse -> AdminProductResponse 변경

2. 고객용 ProductResponse와 관리자용 응답 DTO 분리

3. 기존 등록/수정/삭제 API 경로와 동작은 그대로 유지
*/