package com.back.nbe141team5.order.controller;

import com.back.nbe141team5.order.dto.OrderAddressUpdateRequest;
import com.back.nbe141team5.order.dto.OrderCreateRequest;
import com.back.nbe141team5.order.dto.OrderResponse;
import com.back.nbe141team5.order.service.OrderService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/orders") // ⬅️ [수정] 표준 경로 슬래시(/) 추가
public class OrderController {

    private final OrderService orderService;

    // 주문 생성
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody @Valid OrderCreateRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 주문 목록 조회 (이메일 쿼리 파라미터 검색 지원)
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getOrders(
            HttpSession session
    ) {

        String email = (String) session.getAttribute(
                "verifiedOrderEmail"
        );

        if (email == null) {
            throw new IllegalStateException(
                    "이메일 인증이 필요합니다."
            );
        }

        List<OrderResponse> responses = orderService.getOrders(email);
        return ResponseEntity.ok(responses);
    }

    // 개별 주문 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        OrderResponse response = orderService.getOrderById(id);
        return ResponseEntity.ok(response);
    }

    // 주문 배송 정보 수정
    @PatchMapping("/{id}")
    public ResponseEntity<OrderResponse> updateOrder(
            @PathVariable Long id,
            @RequestBody OrderAddressUpdateRequest request
    ) {
        OrderResponse response = orderService.updateOrder(id, request);
        return ResponseEntity.ok(response);
    }

    // 주문 취소
    @DeleteMapping("/{id}")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long id) {
        OrderResponse response = orderService.cancelOrder(id);
        return ResponseEntity.ok(response);
    }
}
