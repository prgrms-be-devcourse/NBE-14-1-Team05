package com.back.nbe141team5.product.controller;

import com.back.nbe141team5.product.dto.ProductResponse;
import com.back.nbe141team5.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/products")
public class ProductController {
    public final ProductService productService;

    //전체 상품 조회 API
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getProducts() {
        List<ProductResponse> responses = productService.getProductList()
                .stream()
                .map(ProductResponse::from)
                .toList();
        return ResponseEntity.ok(responses);  //상태 코드 200 & 데이터 보내기
    }

    //특정 상품 상세 조회 API
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductDetail(@PathVariable Long id) {
        ProductResponse response = ProductResponse.from(productService.getProductDetail(id));
        return ResponseEntity.ok(response);
    }
}
