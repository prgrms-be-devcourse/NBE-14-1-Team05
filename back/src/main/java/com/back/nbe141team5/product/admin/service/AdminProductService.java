package com.back.nbe141team5.product.admin.service;

import com.back.nbe141team5.product.dto.AdminProductResponse;
import com.back.nbe141team5.product.dto.ProductCreateRequest;
import com.back.nbe141team5.product.dto.ProductUpdateRequest;
import com.back.nbe141team5.product.entity.Product;
import com.back.nbe141team5.product.exception.ProductNotFoundException;
import com.back.nbe141team5.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminProductService {

    private final ProductRepository productRepository;

    // 상품 등록
    @Transactional
    public AdminProductResponse createProduct(
            ProductCreateRequest request
    ) {
        Product product = new Product(
                request.name(),
                request.price(),
                request.description(),
                request.imageUrl()
        );

        Product savedProduct = productRepository.save(product);

        return AdminProductResponse.from(savedProduct);
    }

    // 상품 단건 조회
    @Transactional(readOnly = true)
    public AdminProductResponse getProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        return AdminProductResponse.from(product);
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

    // 전체 상품 조회
    @Transactional(readOnly = true)
    public Page<Product> getProducts(int page) {
        Pageable pageable = PageRequest.of(page, 10);

        return productRepository.findAll(pageable);
    }
}