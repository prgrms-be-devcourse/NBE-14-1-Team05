package com.back.nbe141team5.order.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class DeliveryPolicyUtilsTest {

    @Test
    @DisplayName("14시 이전 주문(~ 13:59:59) 은 당일 처리 되어 익일 배송일에 계산된다.")
    void testBeforeCutoffTime() {
        //given
        LocalDateTime orderTime = LocalDateTime.of(2026, 8, 24, 13, 59, 59);
        LocalDate expectedDeliveryDate = LocalDate.of(2026, 8, 25);

        //when
        LocalDate resultDate = DeliveryPolicyUtils.calculateDeliveryDate(orderTime);

        //then
        assertThat(resultDate).isEqualTo(expectedDeliveryDate);
    }

    @Test
    @DisplayName("14시 이후 주문(14:00:00 ~) 은 익일 처리 되어 이틀 후 배송일에 계산된다.")
    void testAfterCutoffTime() {
        //given
        LocalDateTime orderTime = LocalDateTime.of(2026, 8, 24, 14, 0, 0);
        LocalDate expectedDeliveryDate = LocalDate.of(2026, 8, 26);

        //when
        LocalDate resultDate = DeliveryPolicyUtils.calculateDeliveryDate(orderTime);

        //then
        assertThat(resultDate).isEqualTo(expectedDeliveryDate);
    }
}