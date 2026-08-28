package com.back.nbe141team5.order.repository;

import com.back.nbe141team5.mail.EmailService;
import com.back.nbe141team5.order.entity.CoffeeOrder;
import com.back.nbe141team5.order.entity.OrderStatus;
import com.back.nbe141team5.product.entity.Product;
import com.back.nbe141team5.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.util.StopWatch;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Disabled("100만 건 대용량 벤치마크 테스트 (필요 시에만 주석 해제 후 수동 실행)")
@SpringBootTest
class OrderPerformanceBenchmarkTest {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 2중 안전장치: 이메일 발송 빈을 Mock으로 격리하여 실제 발송 차단
    @MockitoBean
    private EmailService emailService;

    // 100만 건 대용량 데이터 테스트
    private static final int TOTAL_ORDERS = 1_000_000;
    private static final int BATCH_SIZE = 5_000;

    @BeforeEach
    void setUpLargeData() {
        // 1. 기본 상품 등록 및 실제 등록된 Product ID 조회
        if (productRepository.count() == 0) {
            productRepository.save(new Product("에티오피아 예가체프", 5000, "꽃향기와 상큼한 산미", ""));
            productRepository.save(new Product("과테말라 안티구아", 6000, "스모키한 풍미와 묵직한 바디감", ""));
            productRepository.save(new Product("콜롬비아 수프레모", 4500, "마일드한 균형감", ""));
        }

        List<Product> products = productRepository.findAll();
        Long defaultProductId = products.get(0).getId();

        // 2. 기존 데이터 확인 후 비어있을 때만 대용량 데이터 적재
        Integer count = jdbcTemplate.queryForObject("SELECT count(*) FROM orders", Integer.class);
        if (count != null && count >= TOTAL_ORDERS) {
            return;
        }

        System.out.println("대용량 더미 데이터 " + TOTAL_ORDERS + "건 고속 적재를 시작합니다...");
        StopWatch insertWatch = new StopWatch();
        insertWatch.start();

        Random random = new Random();
        OrderStatus[] statuses = OrderStatus.values();
        LocalDateTime baseDate = LocalDateTime.now();

        List<Object[]> orderBatch = new ArrayList<>();
        List<Object[]> itemBatch = new ArrayList<>();

        for (int i = 1; i <= TOTAL_ORDERS; i++) {
            String email = "user" + (i % 5_000) + "@test.com"; // 5,000명의 고객이 반복 주문
            String address = "서울시 서초구 반포대로 " + (i % 100);
            String postcode = String.format("%05d", 10000 + (i % 90000));

            // 최근 30일 이내로 랜덤 분산된 주문일시
            LocalDateTime orderDate = baseDate.minusDays(random.nextInt(30)).minusHours(random.nextInt(24)).minusMinutes(random.nextInt(60));
            // 배송일은 주문일 기준 정책 반영
            LocalDateTime deliveryDate = orderDate.toLocalDate().plusDays(1).atStartOfDay();
            OrderStatus status = statuses[random.nextInt(statuses.length)];
            int totalPrice = (random.nextInt(10) + 1) * 5000;

            orderBatch.add(new Object[]{
                    (long) i, email, address, postcode,
                    Timestamp.valueOf(orderDate), status.name(), totalPrice,
                    Timestamp.valueOf(deliveryDate),
                    Timestamp.valueOf(orderDate), Timestamp.valueOf(orderDate)
            });

            itemBatch.add(new Object[]{
                    (long) i, "에티오피아 예가체프", random.nextInt(3) + 1, (long) i, defaultProductId
            });

            if (orderBatch.size() >= BATCH_SIZE) {
                insertOrderBatch(orderBatch);
                insertItemBatch(itemBatch);
                orderBatch.clear();
                itemBatch.clear();
            }
        }

        if (!orderBatch.isEmpty()) {
            insertOrderBatch(orderBatch);
            insertItemBatch(itemBatch);
        }

        insertWatch.stop();
        System.out.println("대용량 데이터 적재 완료! 소요 시간: " + insertWatch.getTotalTimeMillis() + "ms");
    }

    private void insertOrderBatch(List<Object[]> batch) {
        String sql = "INSERT INTO orders (id, email, address, postcode, order_date, status, total_price, delivery_date, created_date, updated_date) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.batchUpdate(sql, batch);
    }

    private void insertItemBatch(List<Object[]> batch) {
        String sql = "INSERT INTO order_items (id, product_name, quantity, order_id, product_id) VALUES (?, ?, ?, ?, ?)";
        jdbcTemplate.batchUpdate(sql, batch);
    }

    @Test
    @DisplayName("[성능 벤치마크] 주요 핵심 쿼리 응답 속도 측정")
    void measureQueryPerformance() {
        System.out.println("\n=======================================================");
        System.out.println("           [성능 벤치마크 측정 시작] (" + TOTAL_ORDERS + "건)");
        System.out.println("=======================================================");

        // 1. 당일 배송 대상 주문 조회 성능
        LocalDateTime targetDeliveryDate = LocalDate.now().atStartOfDay();
        StopWatch sw1 = new StopWatch();
        sw1.start();
        List<CoffeeOrder> deliveries = orderRepository.findAllByDeliveryDateOrderByOrderDateAsc(targetDeliveryDate);
        sw1.stop();
        System.out.printf("1. 당일 배송 대상 주문 조회 (%d건 발견) : %d ms\n", deliveries.size(), sw1.getTotalTimeMillis());

        // 2. 고객 이메일별 미배송 최근 주문 조회 성능 (인덱스 탐색)
        StopWatch sw2 = new StopWatch();
        sw2.start();
        var latestOrder = orderRepository.findTopByEmailAndStatusOrderByOrderDateDesc("user100@test.com", OrderStatus.ORDERED);
        sw2.stop();
        System.out.printf("2. 고객별 최근 미배송 주문 탐색 : %d ms\n", sw2.getTotalTimeMillis());

        // 3. 관리자 다중 조건 검색 및 정렬 (상태 + 날짜 범위 + 페이징)
        LocalDateTime startDate = LocalDateTime.now().minusDays(7);
        LocalDateTime endDate = LocalDateTime.now();
        StopWatch sw3 = new StopWatch();
        sw3.start();
        var pagedOrders = orderRepository.searchOrders("user", null, OrderStatus.ORDERED, startDate, endDate, PageRequest.of(0, 10));
        sw3.stop();
        System.out.printf("3. 관리자 주문 다중 조건 검색 및 페이징 (%d건 중 10건) : %d ms\n", pagedOrders.getTotalElements(), sw3.getTotalTimeMillis());

        // 4. 판매 수량 기준 TOP 3 집계 쿼리 (Join + Group By)
        StopWatch sw4 = new StopWatch();
        sw4.start();
        var topProducts = orderRepository.findTopQuantityProducts(PageRequest.of(0, 3));
        sw4.stop();
        System.out.printf("4. 판매 수량 TOP 3 상품 집계 : %d ms\n", sw4.getTotalTimeMillis());

        // 5. 특정 고객의 전체 주문 내역 조회 (인덱스 탐색)
        StopWatch sw5 = new StopWatch();
        sw5.start();
        var userOrders = orderRepository.findAllByEmailOrderByOrderDateDesc("user100@test.com");
        sw5.stop();
        System.out.printf("5. 특정 고객의 전체 주문 내역 조회 (%d건 발견) : %d ms\n", userOrders.size(), sw5.getTotalTimeMillis());

        System.out.println("=======================================================\n");
    }
}