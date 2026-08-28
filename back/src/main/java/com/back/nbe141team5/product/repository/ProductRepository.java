package com.back.nbe141team5.product.repository;

import com.back.nbe141team5.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // 판매중 상품 조회
    List<Product> findAllByIsActiveTrue();

    // 판매중 상품 페이징 조회
    Page<Product> findAllByIsActiveTrue(Pageable pageable);

    // 판매중단 상품 페이징 조회
    Page<Product> findAllByIsActiveFalse(Pageable pageable);

    // 판매중 상품 단건 조회
    Optional<Product> findByIdAndIsActiveTrue(Long id);

    // 관리자 상품 상태별 개수
    long countByIsActiveTrue();

    long countByIsActiveFalse();

    // 상품명 검색 페이징 조회 (대소문자 무시)
    Page<Product> findAllByNameContainingIgnoreCaseAndIsActiveTrue(String name, Pageable pageable);

    Page<Product> findAllByNameContainingIgnoreCaseAndIsActiveFalse(String name, Pageable pageable);

    Page<Product> findAllByNameContainingIgnoreCase(String name, Pageable pageable);
}