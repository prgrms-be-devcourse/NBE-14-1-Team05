package com.back.nbe141team5.order.service;

import com.back.nbe141team5.order.dto.OrderItemRequest;
import com.back.nbe141team5.order.dto.OrderRequest;
import com.back.nbe141team5.order.dto.OrderResponse;
import com.back.nbe141team5.order.entity.CoffeeOrder;
import com.back.nbe141team5.order.entity.OrderItem;
import com.back.nbe141team5.order.entity.OrderStatus;
import com.back.nbe141team5.order.repository.OrderRepository;
import com.back.nbe141team5.product.entity.Product;
import com.back.nbe141team5.product.exception.ProductNotFoundException;
import com.back.nbe141team5.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    // [메인 진입점] 주문 생성 요청 처리
    @Transactional
    public Long createOrder(OrderRequest request) {
        LocalDateTime now = LocalDateTime.now();

        return tryMergeWithExistingOrder(request, now)
                .orElseGet(() -> createNewOrder(request, now));
    }

    // 합배송 (주문 병합) 함수
    private Optional<Long> tryMergeWithExistingOrder(OrderRequest request, LocalDateTime now) {
        return orderRepository.findTopByEmailAndStatusOrderByOrderDateDesc(request.email(), OrderStatus.ORDERED)
                .filter(order -> order.isSameAddress(request.address(), request.postcode()))
                .filter(order -> DeliveryPolicyUtils.isSameDeliveryGroup(order.getOrderDate(), now))
                .map(order -> {
                    mergeItemsToOrder(request, order);
                    return order.getId();
                });
    }

    private void mergeItemsToOrder(OrderRequest request, CoffeeOrder order) {
        // 상품 병합 및 총 금액 갱신
        int additionalPrice = 0;
        for (OrderItemRequest itemRequest : request.orderItems()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new ProductNotFoundException(itemRequest.productId()));
            additionalPrice += product.getPrice() * itemRequest.quantity();
            order.addOrUpdateOrderItem(product, itemRequest.quantity());
        }
        order.updateTotalPrice(order.getTotalPrice() + additionalPrice);
    }


    // 기존 신규 주문 생성 로직
    public Long createNewOrder(OrderRequest request, LocalDateTime orderDate) {
        // 배송 정책(14시 기준)에 따라 배송 예정일 계산 후 자정(00:00:00) 기준 일시로 변환
        LocalDateTime deliveryDate = DeliveryPolicyUtils.calculateDeliveryDate(orderDate).atStartOfDay();

        int totalPrice = 0;

        // 1. 빈 주문서 생성
        CoffeeOrder order = new CoffeeOrder(
                request.email(),
                request.address(),
                request.postcode(),
                0,
                orderDate,
                OrderStatus.ORDERED,
                deliveryDate
        );

        // 2. 주문서에 원두 목록 확인 및 추가
        for (OrderItemRequest itemRequest : request.orderItems()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new ProductNotFoundException(itemRequest.productId()));

            totalPrice += product.getPrice() * itemRequest.quantity();

            OrderItem orderItem = new OrderItem(product, itemRequest.quantity());
            order.addOrderItem(orderItem);
        }

        // 3. 계산된 총 금액 업데이트 및 DB 저장
        order.updateTotalPrice(totalPrice);
        CoffeeOrder savedOrder = orderRepository.save(order);

        return savedOrder.getId();
    }

    // 전체 주문 목록 조회
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(OrderResponse::from)
                .toList();
    }

    // 개별 주문 상세 조회
    public OrderResponse getOrderById(Long id) {
        CoffeeOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 주문입니다. ID: " + id)); // OrderNotFoundException 만들면 수정예정
        return OrderResponse.from(order);
    }
}
