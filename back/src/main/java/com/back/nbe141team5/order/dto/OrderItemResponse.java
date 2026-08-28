package com.back.nbe141team5.order.dto;

import com.back.nbe141team5.order.entity.OrderItem;

public record OrderItemResponse(
        Long id,
        Long productId,
        String productName,
        Integer quantity,
        Integer price
) {
    public static OrderItemResponse from(OrderItem item) {
        Long prodId = null;

        if (item.getProduct() != null) {
            prodId = item.getProduct().getId();
        }

        return new OrderItemResponse(
                item.getId(),
                prodId,
                item.getProductName(),
                item.getQuantity(),
                item.getPrice()
        );
    }
}
