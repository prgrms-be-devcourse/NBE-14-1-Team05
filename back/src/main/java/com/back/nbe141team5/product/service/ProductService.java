package com.back.nbe141team5.product.service;

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
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    // 활성 상품 목록 페이징 조회
    public Page<Product> getProductList(int page) {
        Pageable pageable = PageRequest.of(page, 6);

        return productRepository.findAllByIsActiveTrue(pageable);
    }

    // 활성 상품 상세 조회
    public Product getProductDetail(Long id) {
        return productRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }
}