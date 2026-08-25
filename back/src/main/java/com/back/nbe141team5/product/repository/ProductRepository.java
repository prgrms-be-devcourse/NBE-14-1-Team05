package com.back.nbe141team5.product.repository;

import com.back.nbe141team5.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}

/*
[Rebase Conflict 해결 내용]

1. Product의 PK 타입에 맞게 JpaRepository<Product, Long> 유지

2. Optional<Product> findById(Long id) 제거
   - JpaRepository에서 기본 제공하는 메서드라 중복 선언할 필요 없음

3. 사용하지 않는 Optional import 제거
*/