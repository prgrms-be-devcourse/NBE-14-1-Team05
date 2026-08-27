package com.back.nbe141team5.order.dto;

public record TopProductResponse(
        String productName,
        long quantity,
        long revenue
) {
}