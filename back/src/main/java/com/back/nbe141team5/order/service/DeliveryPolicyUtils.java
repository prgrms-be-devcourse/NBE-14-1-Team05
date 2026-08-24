package com.back.nbe141team5.order.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class DeliveryPolicyUtils {

    private static final LocalTime CUTOFF_TIME = LocalTime.of(14, 0);

    /**
     * 결제 (주문) 시간을 기준으로 배송 시작일 계산
     * 14시 이전: 당일 처리
     * 14시 이후(14:00포함): 익일 처리
     */
    public static LocalDate calculateDeliveryDate(LocalDateTime orderTime) {
        LocalDate orderDate = orderTime.toLocalDate();
        LocalTime time = orderTime.toLocalTime();

        // TODO: time이 CUTOFF_TIME 이전인지 이후인지 판별하여
        // orderDate에 plusDays(1) 또는 plusDays(2)를 해서 반환하는 로직 작성

        return null;
    }
}
