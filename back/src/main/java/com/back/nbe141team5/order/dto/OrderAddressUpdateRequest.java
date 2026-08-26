package com.back.nbe141team5.order.dto;

public record OrderAddressUpdateRequest(
        String address,
        String postcode
) {}