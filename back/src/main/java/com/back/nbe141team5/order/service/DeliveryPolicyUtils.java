package com.back.nbe141team5.order.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class DeliveryPolicyUtils {

    private static final LocalTime CUTOFF_TIME = LocalTime.of(14, 0);

    /**
     * 결제 (주문) 시간을 기준으로 배송 시작일 계산
     * 14시 이전: 당일 처리 (배송일 = 주문일 + 1일)
     * 14시 이후(14:00포함): 익일 처리 (배송일 = 주문일 + 2일)
     */
    public static LocalDate calculateDeliveryDate(LocalDateTime orderTime) {
        if (orderTime == null) {
            throw new IllegalArgumentException("주문 일시는 null일 수 없습니다.");
        }

        LocalDate orderDate = orderTime.toLocalDate();
        LocalTime time = orderTime.toLocalTime();

        // 14시 이전 주문은 당일 처리 (다음 날 배송 시작)
        if (time.isBefore(CUTOFF_TIME)) {
            return orderDate.plusDays(1);
        }

        // 14시 정각 포함 이후 주문은 익일 처리 (이틀 후 배송 시작)
        return orderDate.plusDays(2);
    }

    /**
     * 기존 주문 시점과 신규 주문 시점이 동일한 배송 그룹 (동일 배송 시작일) 에 속하는지 검증
     */
    public static boolean isSameDeliveryGroup(LocalDateTime existingOrderTime, LocalDateTime newOrderTime) {
        if (existingOrderTime == null || newOrderTime == null) {
            return false;
        }

        LocalDate existingDeliveryDate = calculateDeliveryDate(existingOrderTime);
        LocalDate newDeliveryDate = calculateDeliveryDate(newOrderTime);

        return existingDeliveryDate.equals(newDeliveryDate);
    }
}
