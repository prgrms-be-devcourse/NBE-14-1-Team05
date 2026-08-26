package com.back.nbe141team5.product.controller;

import com.back.nbe141team5.product.dto.AdminProductResponse;
import com.back.nbe141team5.product.dto.ProductCreateRequest;
import com.back.nbe141team5.product.dto.ProductUpdateRequest;
import com.back.nbe141team5.product.service.AdminProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductService adminProductService;

    // 상품 등록
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminProductResponse createProduct(
            @Valid @RequestBody ProductCreateRequest request
    ) {
        return adminProductService.createProduct(request);
    }

    // 상품 수정
    @PutMapping("/{id}")
    public AdminProductResponse updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request
    ) {
        return adminProductService.updateProduct(id, request);
    }

    // 상품 삭제
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) {
        adminProductService.deleteProduct(id);
    }

    /// 상품 조회
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public Page<AdminProductResponse> getProducts(@RequestParam(defaultValue = "0") int page) {
        return adminProductService.getProducts(page)
                .map(AdminProductResponse::from);
    }
}