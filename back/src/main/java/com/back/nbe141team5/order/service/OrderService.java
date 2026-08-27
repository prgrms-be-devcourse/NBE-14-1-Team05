package com.back.nbe141team5.order.service;

import com.back.nbe141team5.mail.EmailService;
import com.back.nbe141team5.order.dto.OrderAddressUpdateRequest;
import com.back.nbe141team5.order.dto.OrderCreateRequest;
import com.back.nbe141team5.order.dto.OrderItemRequest;
import com.back.nbe141team5.order.dto.OrderResponse;
import com.back.nbe141team5.order.entity.CoffeeOrder;
import com.back.nbe141team5.order.entity.OrderItem;
import com.back.nbe141team5.order.entity.OrderStatus;
import com.back.nbe141team5.order.repository.OrderRepository;
import com.back.nbe141team5.product.entity.Product;
import com.back.nbe141team5.product.exception.ProductNotFoundException;
import com.back.nbe141team5.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;

    // [메인 진입점] 주문 생성 요청 처리
    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request) {
        LocalDateTime now = LocalDateTime.now();

        CoffeeOrder savedOrder = tryMergeWithExistingOrder(request, now)
                .orElseGet(() -> createNewOrder(request, now));


        // 메일 전송 실패가 주문 생성 자체를 실패시키지 않도록 여기서 흡수하고 로그만 남긴다.
        try {
            String subject = "Grids & Circles #" + savedOrder.getId() + " Order Completed";
            String content = createReceipt(savedOrder);
            emailService.sendEmail(request.email(), subject, content);
        } catch (Exception e) {
            log.error("주문 완료 메일 전송 실패. orderId={}, email={}", savedOrder.getId(), request.email(), e);
        }

        return OrderResponse.from(savedOrder);
    }

    // 주문 정보를 조회해 주문 완료 안내 메일 본문(HTML)을 생성한다.
    private String createReceipt(CoffeeOrder coffeeOrder) {

        StringBuilder content = new StringBuilder(
                """
                        <html>
                        <body style="
                            font-family: Arial, sans-serif;
                            background-color: #f5f5f5;
                            padding: 30px;
                        ">
                        
                            <div style="
                                max-width: 600px;
                                margin: 0 auto;
                                background-color: white;
                                padding: 30px;
                                border-radius: 10px;
                            ">
                        
                                <h2 style="margin-bottom: 10px;">
                                    결제가 완료되었습니다.
                                </h2>
                        
                                <p style="color: #666;">
                                    주문번호: %d
                                </p>
                        
                                <hr style="
                                    border: none;
                                    border-top: 1px solid #ddd;
                                    margin: 25px 0;
                                ">
                        
                                <h3>주문 내역</h3>
                        """.formatted(coffeeOrder.getId())
        );

        for (OrderItem item : coffeeOrder.getOrderItems()) {

            int itemPrice =
                    item.getQuantity() * item.getProduct().getPrice();

            content.append(
                    """
                            <div style="
                                padding: 15px 0;
                                border-bottom: 1px solid #eee;
                            ">
                                <p style="margin: 5px 0;">
                                    <strong>%s</strong>
                                </p>
                            
                                <p style="
                                    margin: 5px 0;
                                    color: #666;
                                ">
                                    수량: %d개
                                </p>
                            
                                <p style="margin: 5px 0;">
                                    금액: %,d원
                                </p>
                            </div>
                            """.formatted(
                            item.getProductName(),
                            item.getQuantity(),
                            itemPrice
                    )
            );
        }

        content.append(
                """
                            <div style="
                                margin-top: 25px;
                                padding-top: 20px;
                                text-align: right;
                            ">
                                <p style="
                                    font-size: 18px;
                                    margin: 0;
                                ">
                                    총 결제금액
                                </p>
                        
                                <p style="
                                    font-size: 24px;
                                    font-weight: bold;
                                    margin-top: 8px;
                                ">
                                    %,d원
                                </p>
                            </div>
                        
                            <hr style="
                                border: none;
                                border-top: 1px solid #ddd;
                                margin: 25px 0;
                            ">
                        
                            <p style="
                                text-align: center;
                                color: #777;
                                font-size: 14px;
                            ">
                                이용해주셔서 감사합니다.
                            </p>
                        
                        </div>
                        </body>
                        </html>
                        """.formatted(coffeeOrder.getTotalPrice())
        );

        return content.toString();
    }

    // 합배송 (주문 병합) 함수 -> CoffeeOrder 객체 반환
    private Optional<CoffeeOrder> tryMergeWithExistingOrder(OrderCreateRequest request, LocalDateTime now) {
        return orderRepository.findTopByEmailAndStatusOrderByOrderDateDesc(request.email(), OrderStatus.ORDERED)
                .filter(order -> order.isSameAddress(request.address(), request.postcode()))
                .filter(order -> DeliveryPolicyUtils.isSameDeliveryGroup(order.getOrderDate(), now))
                .map(order -> {
                    mergeItemsToOrder(request, order);
                    return order;  // 수정 order.getId() -> order 엔티티 자체 반환
                });
    }

    // 상품 병합 및 총 금액 갱신
    private void mergeItemsToOrder(OrderCreateRequest request, CoffeeOrder order) {
        int additionalPrice = 0;
        for (OrderItemRequest itemRequest : request.orderItems()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new ProductNotFoundException(itemRequest.productId()));
            additionalPrice += product.getPrice() * itemRequest.quantity();
            order.addOrUpdateOrderItem(product, itemRequest.quantity());
        }
        order.updateTotalPrice(order.getTotalPrice() + additionalPrice);
    }


    // 신규 주문 생성 로직 -> CoffeeOrder 엔티티 생성 및 DB 저장 후 엔티티 반환
    public CoffeeOrder createNewOrder(OrderCreateRequest request, LocalDateTime orderDate) {
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
        return orderRepository.save(order);
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

    // 주문 상태 변경
    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatus newStatus) {
        CoffeeOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 주문입니다. ID: " + id));

        order.updateStatus(newStatus);
        return OrderResponse.from(order);
    }

    // 특정 배송 예정일 (deliveryDate) 기준 주문 목록 조회
    public List<OrderResponse> getDeliveryOrdersByDate(LocalDate targetDate) {
        LocalDateTime deliveryDateTime = targetDate.atStartOfDay();
        return orderRepository.findAllByDeliveryDateOrderByOrderDateAsc(deliveryDateTime)
                .stream()
                .map(OrderResponse::from)
                .toList();
    }


    // [주문 취소]
    @Transactional
    public OrderResponse cancelOrder(Long id) {
        CoffeeOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 주문입니다. ID: " + id));

        // 배송 시작 전(ORDERED 상태)일 때만 취소 가능
        if (order.getStatus() != OrderStatus.ORDERED) {
            throw new IllegalStateException("주문 접수(ORDERED) 상태일 때만 취소할 수 있습니다.");
        }

        order.cancel();
        return OrderResponse.from(order);
    }

    // [주문 배송지 수정]
    @Transactional
    public OrderResponse updateOrder(Long id, OrderAddressUpdateRequest request) {
        CoffeeOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 주문입니다. ID: " + id));

        // 배송 시작 전(ORDERED 상태)일 때만 수정 가능
        if (order.getStatus() != OrderStatus.ORDERED) {
            throw new IllegalStateException("주문 접수(ORDERED) 상태일 때만 배송 정보를 수정할 수 있습니다.");
        }

        order.updateDeliveryInfo(request.address(), request.postcode());
        return OrderResponse.from(order);
    }

    // 주문 목록 조회 (이메일 조건부 검색 지원)
    public List<OrderResponse> getOrders(String email) {
        if (email != null && !email.isBlank()) {
            return orderRepository.findAllByEmailOrderByOrderDateDesc(email).stream()
                    .map(OrderResponse::from)
                    .toList();
        }
        return orderRepository.findAll().stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAdminOrders(
            String email,
            OrderStatus status,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable
    ) {
        LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = (endDate != null) ? endDate.atTime(LocalTime.MAX) : null;

        return orderRepository.searchOrders(email, status, startDateTime, endDateTime, pageable)
                .map(OrderResponse::from);
    }
}
