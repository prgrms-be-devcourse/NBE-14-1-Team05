package com.back.nbe141team5;

import com.back.nbe141team5.product.entity.Product;
import com.back.nbe141team5.product.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class Nbe141Team5ApplicationTests {

    @Autowired
    private ProductRepository productRepository;

    @Test
    void test1() {
        Product product = new Product(
                "아메리카노",
                4500,
                "깔끔하고 고소한 커피",
                "americano.jpg"
        );

        productRepository.save(product);
    }

    @Test
    void test2() {
        Product product = new Product(
                "옛날 커피",
                1500,
                "달달한 커피",
                "coffee.jpg"
        );

        productRepository.save(product);
    }

}
