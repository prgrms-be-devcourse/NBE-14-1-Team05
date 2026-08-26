package com.back.nbe141team5.product.dto;

import org.springframework.data.domain.Page;

import java.util.List;

public record AdminProductPageResponse(
        List<AdminProductResponse> content,
        int totalPages,
        long totalElements,
        int number,
        long activeCount,
        long inactiveCount,
        long allCount
) {

    public static AdminProductPageResponse from(
            Page<AdminProductResponse> page,
            long activeCount,
            long inactiveCount,
            long allCount
    ) {
        return new AdminProductPageResponse(
                page.getContent(),
                page.getTotalPages(),
                page.getTotalElements(),
                page.getNumber(),
                activeCount,
                inactiveCount,
                allCount
        );
    }
}