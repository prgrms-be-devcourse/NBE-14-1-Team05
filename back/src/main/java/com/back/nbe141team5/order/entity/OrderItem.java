package com.back.nbe141team5.order.entity;

import jakarta.persistence.Id;

public class OrderItem {

    @Id
    private Long id;

    private String productName;

    private Integer quantity;

    private Order order;
}
