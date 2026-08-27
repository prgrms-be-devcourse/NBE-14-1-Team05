package com.back.nbe141team5.order.service;

import com.back.nbe141team5.order.dto.AdminStatsResponse;
import com.back.nbe141team5.order.dto.DailySalesResponse;
import com.back.nbe141team5.order.dto.MonthlySalesResponse;
import com.back.nbe141team5.order.dto.TopProductResponse;
import com.back.nbe141team5.order.entity.CoffeeOrder;
import com.back.nbe141team5.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.LongStream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminStatsService {

    private final OrderRepository orderRepository;

    // 관리자 대시보드 통계 데이터 종합 조회
    public AdminStatsResponse getStats() {
        long totalRevenue = orderRepository.getTotalRevenue();
        long totalOrders = orderRepository.count();
        long todayDeliveries = orderRepository.findAllByDeliveryDateOrderByOrderDateAsc(
                LocalDate.now().atStartOfDay()
        ).size();

        // 판매 수량 및 매출액 기준 TOP 3 상품 조회
        List<TopProductResponse> topQuantityProducts = mapToTopProducts(
                orderRepository.findTopQuantityProducts(PageRequest.of(0, 3))
        );
        List<TopProductResponse> topRevenueProducts = mapToTopProducts(
                orderRepository.findTopRevenueProducts(PageRequest.of(0, 3))
        );

        // 정상 주문 대상 일별/월별 매출 집계
        List<CoffeeOrder> activeOrders = orderRepository.findAllActiveOrders();
        List<DailySalesResponse> dailySales = calculateDailySales(activeOrders);
        List<MonthlySalesResponse> monthlySales = calculateMonthlySales(activeOrders);

        return new AdminStatsResponse(
                totalRevenue,
                totalOrders,
                todayDeliveries,
                topQuantityProducts,
                topRevenueProducts,
                dailySales,
                monthlySales
        );
    }

    // TOP 3 쿼리 결과 배열을 DTO로 변환
    private List<TopProductResponse> mapToTopProducts(List<Object[]> rawList) {
        return rawList.stream()
                .map(row -> new TopProductResponse(
                        (String) row[0],
                        ((Number) row[1]).longValue(),
                        ((Number) row[2]).longValue()
                ))
                .toList();
    }

    // 최근 7일간 일별 매출 집계
    private List<DailySalesResponse> calculateDailySales(List<CoffeeOrder> activeOrders) {
        Map<LocalDate, List<CoffeeOrder>> byDate = activeOrders.stream()
                .collect(Collectors.groupingBy(o -> o.getOrderDate().toLocalDate()));

        LocalDate today = LocalDate.now();
        return LongStream.rangeClosed(0, 6)
                .mapToObj(i -> {
                    LocalDate date = today.minusDays(6 - i);
                    List<CoffeeOrder> dayOrders = byDate.getOrDefault(date, Collections.emptyList());
                    long revenue = dayOrders.stream().mapToLong(CoffeeOrder::getTotalPrice).sum();
                    return new DailySalesResponse(date, dayOrders.size(), revenue);
                })
                .toList();
    }

    // 전체 월별 매출 집계 (가장 오래된 주문 월부터 현재 월까지 전체 집계, 최소 6개월 보장)
    private List<MonthlySalesResponse> calculateMonthlySales(List<CoffeeOrder> activeOrders) {
        DateTimeFormatter ymFormatter = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, List<CoffeeOrder>> byMonth = activeOrders.stream()
                .collect(Collectors.groupingBy(o -> o.getOrderDate().format(ymFormatter)));

        LocalDate today = LocalDate.now();
        LocalDate minDate = activeOrders.stream()
                .map(o -> o.getOrderDate().toLocalDate())
                .min(LocalDate::compareTo)
                .orElse(today.minusMonths(5));

        LocalDate sixMonthsAgo = today.minusMonths(5).withDayOfMonth(1);
        LocalDate startDate = minDate.withDayOfMonth(1).isBefore(sixMonthsAgo)
                ? minDate.withDayOfMonth(1)
                : sixMonthsAgo;

        long totalMonths = java.time.temporal.ChronoUnit.MONTHS.between(
                java.time.YearMonth.from(startDate),
                java.time.YearMonth.from(today)
        );

        return LongStream.rangeClosed(0, totalMonths)
                .mapToObj(i -> {
                    String ym = startDate.plusMonths(i).format(ymFormatter);
                    List<CoffeeOrder> monthOrders = byMonth.getOrDefault(ym, Collections.emptyList());
                    long revenue = monthOrders.stream().mapToLong(CoffeeOrder::getTotalPrice).sum();
                    return new MonthlySalesResponse(ym, monthOrders.size(), revenue);
                })
                .toList();
    }
}