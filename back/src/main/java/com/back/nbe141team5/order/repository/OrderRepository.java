package com.back.nbe141team5.order.repository;

import com.back.nbe141team5.order.entity.Order;
import com.back.nbe141team5.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // 특정 사용자의 이메일 미배송 상태에 해당하는 가장 최근 주문 조회
    Optional<Order> findTopByEmailAndStatusOrderByOrderDateDesc(String email, OrderStatus status);
}
