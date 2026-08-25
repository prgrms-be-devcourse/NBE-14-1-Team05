package com.back.nbe141team5.order.dto;

import com.back.nbe141team5.order.entity.CoffeeOrder;
import com.back.nbe141team5.order.entity.OrderItem;
import com.back.nbe141team5.order.entity.OrderStatus;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class OrderResponse {

    private Long id;
    private String email;
    private LocalDateTime orderDate;
    private OrderStatus status;
    private Integer totalPrice;
    private LocalDateTime deliveryDate;
    private List<OrderItemResponse> orderItems;

    public OrderResponse(CoffeeOrder coffeeOrderorder) { // CoffeeOrder를 사용하는 경우 CoffeeOrder로 변경
        this.id = coffeeOrderorder.getId();
        this.email = coffeeOrderorder.getEmail();
        this.orderDate = coffeeOrderorder.getOrderDate();
        this.status = coffeeOrderorder.getStatus();
        this.totalPrice = coffeeOrderorder.getTotalPrice();
        this.deliveryDate = coffeeOrderorder.getDeliveryDate();
        this.orderItems = coffeeOrderorder.getOrderItems().stream()
                .map(OrderItemResponse::new)
                .collect(Collectors.toList());
    }
}