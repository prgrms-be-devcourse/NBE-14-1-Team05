package com.back.nbe141team5.order.dto;

import com.back.nbe141team5.order.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record OrderStatusUpdateRequest(
        @NotNull(message = "주문 상태는 필수입니다.")
        OrderStatus status
) {
}
