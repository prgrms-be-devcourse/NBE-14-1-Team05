package com.back.nbe141team5.order.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

@DisplayName("CoffeeOrder 도메인 엔티티 단위 테스트")
class CoffeeOrderTest {

    @Test
    @DisplayName("5자리 숫자로 이루어진 정상 우편번호로 주문 객체가 정상 생성된다.")
    void createOrder_validPostcode_success() {
        // given & when & then
        assertThatCode(() -> new CoffeeOrder(
                "test@example.com",
                "서울시 강남구",
                "12345",
                20000,
                LocalDateTime.now(),
                OrderStatus.ORDERED,
                LocalDateTime.now().plusDays(1)
        )).doesNotThrowAnyException();

        assertThatCode(() -> new CoffeeOrder(
                "test@example.com",
                "서울시 강남구",
                "01234", // 0으로 시작하는 5자리 우편번호
                20000,
                LocalDateTime.now(),
                OrderStatus.ORDERED,
                LocalDateTime.now().plusDays(1)
        )).doesNotThrowAnyException();
    }

    @ParameterizedTest
    @ValueSource(strings = {"1234", "123456", "abcde", "12a45", "12-34", " 1234", "1234 "})
    @NullAndEmptySource
    @DisplayName("5자리가 아니거나 숫자가 아닌 우편번호 입력 시 IllegalArgumentException이 발생한다.")
    void createOrder_invalidPostcode_throwsException(String invalidPostcode) {
        // when & then
        assertThatThrownBy(() -> new CoffeeOrder(
                "test@example.com",
                "서울시 강남구",
                invalidPostcode,
                20000,
                LocalDateTime.now(),
                OrderStatus.ORDERED,
                LocalDateTime.now().plusDays(1)
        ))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("우편번호는 5자리의 숫자여야 합니다.");
    }

    @Test
    @DisplayName("배송지 수정 시 정상적인 5자리 우편번호로 변경된다.")
    void updateDeliveryInfo_validPostcode_success() {
        // given
        CoffeeOrder order = new CoffeeOrder(
                "test@example.com",
                "서울시 강남구",
                "12345",
                20000,
                LocalDateTime.now(),
                OrderStatus.ORDERED,
                LocalDateTime.now().plusDays(1)
        );

        // when
        order.updateDeliveryInfo("부산시 해운대구", "54321");

        // then
        assertThat(order.getAddress()).isEqualTo("부산시 해운대구");
        assertThat(order.getPostcode()).isEqualTo("54321");
    }

    @ParameterizedTest
    @ValueSource(strings = {"123", "999999", "abcde"})
    @NullAndEmptySource
    @DisplayName("배송지 수정 시 잘못된 우편번호를 입력하면 IllegalArgumentException이 발생한다.")
    void updateDeliveryInfo_invalidPostcode_throwsException(String invalidPostcode) {
        // given
        CoffeeOrder order = new CoffeeOrder(
                "test@example.com",
                "서울시 강남구",
                "12345",
                20000,
                LocalDateTime.now(),
                OrderStatus.ORDERED,
                LocalDateTime.now().plusDays(1)
        );

        // when & then
        assertThatThrownBy(() -> order.updateDeliveryInfo("부산시 해운대구", invalidPostcode))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("우편번호는 5자리의 숫자여야 합니다.");
    }
}