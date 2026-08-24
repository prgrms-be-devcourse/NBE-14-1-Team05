package com.back.nbe141team5.product.entity;

import com.back.nbe141team5.global.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;

@Entity
@Getter
public class Product extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private Integer price;

    private String description;

    private String imageUrl;

    private Boolean isActive;

    // BaseEntity에서 상속 LocalDateTime, updatedDate


    public Product() {
    }

    public Product(
            String name,
            Integer price,
            String description,
            String imageUrl,
            Boolean isActive
    ) {
        this.name = name;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.isActive = isActive;
    }
}
