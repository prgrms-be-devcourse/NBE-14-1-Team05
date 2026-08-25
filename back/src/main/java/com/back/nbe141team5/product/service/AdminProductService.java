package com.back.nbe141team5.product.service;

import com.back.nbe141team5.product.dto.AdminProductResponse;
import com.back.nbe141team5.product.dto.ProductCreateRequest;
import com.back.nbe141team5.product.dto.ProductUpdateRequest;
import com.back.nbe141team5.product.entity.Product;
import com.back.nbe141team5.product.exception.ProductNotFoundException;
import com.back.nbe141team5.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminProductService {

    private final ProductRepository productRepository;

    // 상품 등록
    @Transactional
    public AdminProductResponse createProduct(ProductCreateRequest request) {

        Product product = new Product(
                request.name(),
                request.price(),
                request.description(),
                request.imageUrl()
        );

        Product savedProduct = productRepository.save(product);

        return AdminProductResponse.from(savedProduct);
    }

    // 상품 수정
    @Transactional
    public AdminProductResponse updateProduct(
            Long id,
            ProductUpdateRequest request
    ) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        product.update(
                request.name(),
                request.price(),
                request.description(),
                request.imageUrl()
        );

        return AdminProductResponse.from(product);
    }

    // 상품 삭제 (Soft Delete)
    @Transactional
    public void deleteProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        product.deactivate();
    }
}