package com.back.nbe141team5.product.exception;

public class ProductNotFoundException extends RuntimeException {

    public ProductNotFoundException(Long id) {
        super("상품을 찾을 수 없습니다. productId=" + id);
    }
}