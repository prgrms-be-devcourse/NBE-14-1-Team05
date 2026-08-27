package com.back.nbe141team5.order.dto;

import java.time.LocalDate;

public record DailySalesResponse(
        LocalDate date,
        long orderCount,
        long revenue
) {
}