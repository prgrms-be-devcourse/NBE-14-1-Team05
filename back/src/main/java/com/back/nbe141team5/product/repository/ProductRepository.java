package com.back.nbe141team5.product.repository;

import com.back.nbe141team5.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllByIsActiveTrue();

    Optional<Product> findByIdAndIsActiveTrue(Long id);
}