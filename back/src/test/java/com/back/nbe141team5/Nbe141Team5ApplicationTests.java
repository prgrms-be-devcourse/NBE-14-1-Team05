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
    void initProducts() {
        productRepository.deleteAll();

        Product product1 = new Product(
                "샘플 1",
                4500,
                "샘플 1입니다.",
                "/bean1.png"
        );

        Product product2 = new Product(
                "샘플 2",
                4500,
                "샘플 2입니다.",
                "/bean2.png"
        );

        Product product3 = new Product(
                "샘플 3",
                4500,
                "샘플 3입니다.",
                "/bean3.png"
        );

        Product product4 = new Product(
                "샘플 4",
                4500,
                "샘플 4입니다.",
                "/bean4.png"
        );

        Product product5 = new Product(
                "샘플 5",
                4500,
                "샘플 5입니다.",
                "/bean5.png"
        );

        Product product6 = new Product(
                "샘플 6",
                4500,
                "샘플 6입니다.",
                "/bean6.png"
        );

        productRepository.save(product1);
        productRepository.save(product2);
        productRepository.save(product3);
        productRepository.save(product4);
        productRepository.save(product5);
        productRepository.save(product6);
        System.out.println("상품 개수 = " + productRepository.count());
    }
}

