package com.back.nbe141team5.order.repository;

import com.back.nbe141team5.order.entity.CoffeeOrder;
import com.back.nbe141team5.order.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    // 특정 사용자의 모든 주문 내역 조회 (주문일시 내림차순 정렬)
    List<CoffeeOrder> findAllByEmailOrderByOrderDateDesc(String email);

    // [관리자] 주문 다중 조건 검색 & 페이징 (이메일 부분검색, 주문상태 필터, 주문일자 범위)
    @Query("""
                SELECT o FROM CoffeeOrder o
                WHERE (:email IS NULL OR :email = '' OR LOWER(o.email) LIKE LOWER(CONCAT('%', :email, '%')))
                  AND (:status IS NULL OR o.status = :status)
                  AND (:startDate IS NULL OR o.orderDate >= :startDate)
                  AND (:endDate IS NULL OR o.orderDate <= :endDate)
                ORDER BY o.orderDate DESC
            """)
    Page<CoffeeOrder> searchOrders(
            @Param("email") String email,
            @Param("status") OrderStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );
    
}
