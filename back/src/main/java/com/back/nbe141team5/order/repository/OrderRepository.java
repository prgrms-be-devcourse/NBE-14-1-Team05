package com.back.nbe141team5.order.repository;

import com.back.nbe141team5.order.entity.CoffeeOrder;
import com.back.nbe141team5.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<CoffeeOrder, Long> {

    // 특정 사용자의 이메일 미배송 상태에 해당하는 가장 최근 주문 조회
    Optional<CoffeeOrder> findTopByEmailAndStatusOrderByOrderDateDesc(String email, OrderStatus status);

    // 특정 배송 예정일 (deliveryDate) 기준 주문 목록 조회 (주문시간 오름차순 정렬)
    List<CoffeeOrder> findAllByDeliveryDateOrderByOrderDateAsc(LocalDateTime deliveryDate);

    // 특정 기간 내 배송 예정일 기준 주문 목록 조회 (시작일시 ~ 종료일시)
    List<CoffeeOrder> findAllByDeliveryDateBetweenOrderByOrderDateAsc(LocalDateTime startDateTime, LocalDateTime endDateTime);
}
