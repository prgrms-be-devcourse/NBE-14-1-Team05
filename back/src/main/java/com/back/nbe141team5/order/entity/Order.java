package com.back.nbe141team5.order.entity;

import com.back.nbe141team5.global.BaseEntity;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

public class Order extends BaseEntity {

    @Id
    private Long id;

    private String email;

    private LocalDateTime orderDate;

    private String status;

    private Integer totalPrice;

    private LocalDateTime deliveryDate;
}
