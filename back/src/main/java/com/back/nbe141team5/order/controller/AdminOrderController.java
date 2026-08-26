package com.back.nbe141team5.order.controller;

import com.back.nbe141team5.order.dto.OrderResponse;
import com.back.nbe141team5.order.dto.OrderStatusUpdateRequest;
import com.back.nbe141team5.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    // [관리자] 전체 주문 목록 조회
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> responses = orderService.getAllOrders();
        return ResponseEntity.ok(responses);
    }

    // [관리자] 개별 주문 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        OrderResponse response = orderService.getOrderById(id);
        return ResponseEntity.ok(response);
    }

    // [관리자] 주문 상태 변경 API
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        OrderResponse response = orderService.updateOrderStatus(id, request.status());
        return ResponseEntity.ok(response);
    }

    // [관리자] 당일 (또는 특정 날짜) 배송 대상 주문 목록 조회 API
    @GetMapping("/today-deliveries")
    public ResponseEntity<List<OrderResponse>> getTodayDeliveryOrders(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        List<OrderResponse> responses = orderService.getDeliveryOrdersByDate(targetDate);
        return ResponseEntity.ok(responses);
    }
}