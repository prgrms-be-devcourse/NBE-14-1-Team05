package com.back.nbe141team5.order.dto;

import com.back.nbe141team5.order.entity.OrderItem;
import lombok.Getter;

@Getter
public class OrderItemResponse {

    private Long id;
    private Long productId;
    private String productName;
    private Integer quantity;

    public OrderItemResponse(OrderItem item) {
        this.id = item.getId();
        this.productId = item.getProduct() != null ? item.getProduct().getId() : null;
        this.productName = item.getProductName();
        this.quantity = item.getQuantity();
    }
}
