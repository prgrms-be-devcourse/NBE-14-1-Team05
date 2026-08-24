package com.back.nbe141team5.product.repository;

import com.back.nbe141team5.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    Optional<Product> findById(Long id);
}
