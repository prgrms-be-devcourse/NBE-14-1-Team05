package com.back.nbe141team5.order.dto;

import java.util.List;

public record OrderCreateRequest(
        String email,
        String address,
        String postcode,
        List<OrderItemRequest> orderItems
) {
}