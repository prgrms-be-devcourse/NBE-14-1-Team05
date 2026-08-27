package com.back.nbe141team5.order.dto;

public record MonthlySalesResponse(
        String yearMonth,
        long orderCount,
        long revenue
) {
}