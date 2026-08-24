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

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    // 관리자 상품 등록
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

    // 관리자 상품 수정
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

        productRepository.flush();

        return AdminProductResponse.from(product);
    }

    // 관리자 상품 삭제(비활성화)
    @Transactional
    public void deleteProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        product.deactivate();
    }

    // 고객 전체 상품 조회
    public List<Product> getProductList() {
        return productRepository.findAll();
    }

    // 고객 상품 상세 조회
    public Product getProductDetail(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }
}

/*
[Rebase Conflict 해결 내용]

1. main의 고객 상품 조회 기능 유지
   - getProductList()
   - getProductDetail()

2. 관리자 상품 관리 기능 유지
   - createProduct()
   - updateProduct()
   - deleteProduct()

3. 고객 조회는 @Transactional(readOnly = true) 적용

4. 등록/수정/삭제는 각 메서드에 @Transactional 적용

5. RuntimeException 제거
   - ProductNotFoundException으로 통일

6. Optional 직접 처리 제거
   - findById(...).orElseThrow(...) 사용

7. 관리자 등록/수정 응답은
   ProductResponse가 아닌 AdminProductResponse 사용

8. image 필드명을 imageUrl로 통일

9. 삭제 시 product.deactivate() 호출
   - 실제 DB 삭제가 아니라 isActive=false 처리
*/