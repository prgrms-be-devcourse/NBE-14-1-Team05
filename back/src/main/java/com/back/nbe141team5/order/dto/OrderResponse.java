package com.back.nbe141team5.order.dto;

import com.back.nbe141team5.order.entity.CoffeeOrder;
import com.back.nbe141team5.order.entity.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String email,
        LocalDateTime orderDate,
        OrderStatus status,
        Integer totalPrice,
        LocalDateTime deliveryDate,
        List<OrderItemResponse> orderItems
) {
    public static OrderResponse from(CoffeeOrder order) {
        List<OrderItemResponse> items = order.getOrderItems()
                .stream()
                .map(OrderItemResponse::from)
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getEmail(),
                order.getOrderDate(),
                order.getStatus(),
                order.getTotalPrice(),
                order.getDeliveryDate(),
                items
        );
    }
}