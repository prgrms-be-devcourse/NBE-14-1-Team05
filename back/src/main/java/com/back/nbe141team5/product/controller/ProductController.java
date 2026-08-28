package com.back.nbe141team5.product.controller;

import com.back.nbe141team5.product.dto.ProductResponse;
import com.back.nbe141team5.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/products")
public class ProductController {
    public final ProductService productService;

    //전체 상품 조회 API (검색어 지원)
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) String search
    ) {
        Page<ProductResponse> responses = productService.getProductList(page, search).map(ProductResponse::from);
        return ResponseEntity.ok(responses);
    }

    //특정 상품 상세 조회 API
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductDetail(@PathVariable Long id) {
        ProductResponse response = ProductResponse.from(productService.getProductDetail(id));
        return ResponseEntity.ok(response);
    }
}
