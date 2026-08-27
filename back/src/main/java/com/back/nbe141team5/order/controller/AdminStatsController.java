package com.back.nbe141team5.order.controller;

import com.back.nbe141team5.order.dto.AdminStatsResponse;
import com.back.nbe141team5.order.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/stats")
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    // [관리자] 매출 및 인기 상품 통계 지표 조회
    @GetMapping
    public ResponseEntity<AdminStatsResponse> getStats() {
        AdminStatsResponse response = adminStatsService.getStats();
        return ResponseEntity.ok(response);
    }
}