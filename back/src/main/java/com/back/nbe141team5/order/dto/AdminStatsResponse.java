package com.back.nbe141team5.order.dto;

import java.util.List;

public record AdminStatsResponse(
        long totalRevenue,
        long totalOrders,
        long todayDeliveries,
        List<TopProductResponse> topQuantityProducts,
        List<TopProductResponse> topRevenueProducts,
        List<DailySalesResponse> dailySales,
        List<MonthlySalesResponse> monthlySales
) {
}