package com.back.nbe141team5.product.admin.controller;

import com.back.nbe141team5.product.admin.service.AdminProductService;
import com.back.nbe141team5.product.dto.AdminProductPageResponse;
import com.back.nbe141team5.product.dto.AdminProductResponse;
import com.back.nbe141team5.product.dto.ProductCreateRequest;
import com.back.nbe141team5.product.dto.ProductUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

    // 상품 목록 조회
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public AdminProductPageResponse getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "ACTIVE") String filter
    ) {
        var products = adminProductService
                .getProducts(page, filter)
                .map(AdminProductResponse::from);

        long activeCount =
                adminProductService.getActiveProductCount();

        long inactiveCount =
                adminProductService.getInactiveProductCount();

        long allCount =
                adminProductService.getTotalProductCount();

        return AdminProductPageResponse.from(
                products,
                activeCount,
                inactiveCount,
                allCount
        );
    }

    // 상품 단건 조회
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public AdminProductResponse getProduct(
            @PathVariable Long id
    ) {
        return adminProductService.getProduct(id);
    }

    // 상품 수정
    @PutMapping("/{id}")
    public AdminProductResponse updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request
    ) {
        return adminProductService.updateProduct(id, request);
    }

    // 상품 판매 중단
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(
            @PathVariable Long id
    ) {
        adminProductService.deleteProduct(id);
    }

    // 상품 판매 재개
    @PatchMapping("/{id}/activate")
    public AdminProductResponse activateProduct(
            @PathVariable Long id
    ) {
        return adminProductService.activateProduct(id);
    }

    // 상품 영구 삭제
    @DeleteMapping("/{id}/permanent")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void permanentlyDeleteProduct(
            @PathVariable Long id
    ) {
        adminProductService.permanentlyDeleteProduct(id);
    }
}