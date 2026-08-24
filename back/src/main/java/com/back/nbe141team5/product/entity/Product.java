package com.back.nbe141team5.product.entity;

import com.back.nbe141team5.global.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Integer price;
    private String description;
    private String imageUrl;
    private boolean isActive;

    public Product(
            String name,
            Integer price,
            String description,
            String imageUrl
    ) {
        this.name = name;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this.isActive = true;
    }

    public void update(
            String name,
            Integer price,
            String description,
            String imageUrl
    ) {
        this.name = name;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
    }

    public void deactivate() {
        this.isActive = false;
    }
}

/*
[Rebase Conflict 해결 내용]

1. main의 imageUrl 필드명 유지
2. 관리자 기능의 update(), deactivate() 유지
3. isActive는 Boolean 대신 boolean으로 통일
4. 상품 생성 시 isActive=true를 엔티티 내부에서 기본 처리
5. JPA 기본 생성자는 protected로 제한
*/