package com.back.nbe141team5.order.dto;

import java.util.List;

public record OrderRequest(
        String email,
        List<OrderItemRequest> orderItems
) {
}