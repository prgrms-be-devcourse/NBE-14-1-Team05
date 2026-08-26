package com.back.nbe141team5.order.dto;

public record OrderUpdateRequest(
        String address,
        String postcode
) {}