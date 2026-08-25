package com.back.nbe141team5.order.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class OrderRequest {

    private String email;

    private List<OrderItemRequest> orderItems;

    public OrderRequest(String email, List<OrderItemRequest> orderItems) {
        this.email = email;
        this.orderItems = orderItems;
    }
}
