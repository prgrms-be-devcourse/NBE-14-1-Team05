package com.back.nbe141team5.product.service;

import com.back.nbe141team5.product.entity.Product;
import com.back.nbe141team5.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {
    private final ProductRepository productRepository;

    //전체 상품 조회
    public List<Product> getProductList() {
        return this.productRepository.findAll();
    }

    //특정 상품 상세 조회
    public Product getProductDetail(Long id) {
        Optional<Product> product = this.productRepository.findById(id);
        if (product.isPresent()) {
            return product.get();
        } else {
            throw new RuntimeException(); // 추후 예외 처리 바꾸기
        }
    }
}
