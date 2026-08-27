package com.back.nbe141team5.order.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record OrderCreateRequest(
        @NotBlank @Email String email,
        String address,
        String postcode,
        List<OrderItemRequest> orderItems
) {
}