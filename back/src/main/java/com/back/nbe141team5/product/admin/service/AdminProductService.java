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

    // 상품 판매 중단 (Soft Delete)
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        product.deactivate();
    }

    // 상품 판매 재개
    @Transactional
    public AdminProductResponse activateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        product.activate();

        return AdminProductResponse.from(product);
    }

    // 상품 영구 삭제
    @Transactional
    public void permanentlyDeleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        // 판매 중단된 상품만 영구 삭제 가능
        if (product.isActive()) {
            throw new IllegalStateException(
                    "판매중인 상품은 영구 삭제할 수 없습니다."
            );
        }

        productRepository.delete(product);
    }

    // 관리자 상품 목록 조회
    @Transactional(readOnly = true)
    public Page<Product> getProducts(
            int page,
            String filter
    ) {
        Pageable pageable = PageRequest.of(page, 10);

        if ("ACTIVE".equalsIgnoreCase(filter)) {
            return productRepository.findAllByIsActiveTrue(pageable);
        }

        if ("INACTIVE".equalsIgnoreCase(filter)) {
            return productRepository.findAllByIsActiveFalse(pageable);
        }

        return productRepository.findAll(pageable);
    }

    // 판매중 상품 개수
    @Transactional(readOnly = true)
    public long getActiveProductCount() {
        return productRepository.countByIsActiveTrue();
    }

    // 판매중단 상품 개수
    @Transactional(readOnly = true)
    public long getInactiveProductCount() {
        return productRepository.countByIsActiveFalse();
    }

    // 전체 상품 개수
    @Transactional(readOnly = true)
    public long getTotalProductCount() {
        return productRepository.count();
    }
}