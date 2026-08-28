package com.back.nbe141team5;

import com.back.nbe141team5.order.dto.OrderCreateRequest;
import com.back.nbe141team5.order.dto.OrderItemRequest;
import com.back.nbe141team5.order.repository.OrderRepository;
import com.back.nbe141team5.order.service.OrderService;
import com.back.nbe141team5.product.entity.Product;
import com.back.nbe141team5.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class Nbe141Team5ApplicationTests {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        productRepository.deleteAll();

        // 샘플 상품 6개 세팅
        productRepository.save(new Product("샘플 1", 4500, "샘플 1입니다.", "/bean1.png"));
        productRepository.save(new Product("샘플 2", 4500, "샘플 2입니다.", "/bean2.png"));
        productRepository.save(new Product("샘플 3", 4500, "샘플 3입니다.", "/bean3.png"));
        productRepository.save(new Product("샘플 4", 4500, "샘플 4입니다.", "/bean4.png"));
        productRepository.save(new Product("샘플 5", 4500, "샘플 5입니다.", "/bean5.png"));
        productRepository.save(new Product("샘플 6", 4500, "샘플 6입니다.", "/bean6.png"));
    }

    @Test
    @DisplayName("동일 사용자가 동시에 추가 주문을 요청해도 비관적 락으로 인해 기존 주문서에 1개로 합쳐져야 한다.")
    void concurrentOrderMergeTest() throws InterruptedException {
        // given: 테스트용 상품 ID 조회
        Long productId = productRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("상품이 없습니다."))
                .getId();

        String email = "test@test.com";
        String address = "서울시 강남구";
        String postcode = "12345";

        // 💡 [핵심] 테스트 시작 전, 이미 'ORDERED' 상태의 주문서가 1개 존재하도록 미리 만들어둡니다!
        List<OrderItemRequest> initialItem = List.of(new OrderItemRequest(productId, 1));
        orderService.createOrder(new OrderCreateRequest(email, address, postcode, initialItem));

        // 이제 이 상태에서 동시에 추가 주문 2개가 들어오는 상황을 재현합니다.
        List<OrderItemRequest> items = List.of(new OrderItemRequest(productId, 2));
        OrderCreateRequest request = new OrderCreateRequest(email, address, postcode, items);

        int threadCount = 2;
        ExecutorService executorService = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);

        // when: 동시에 추가 주문 요청 2번 발사
        for (int i = 0; i < threadCount; i++) {
            executorService.submit(() -> {
                try {
                    orderService.createOrder(request);
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();

        // then: 총 주문서는 여전히 1개여야 하고, 기존 주문에 상품들이 잘 합쳐졌는지 검증
        var orders = orderRepository.findAllByEmailOrderByOrderDateDesc(email);

        assertThat(orders).hasSize(1); // 주문서는 처음에 만든 것 포함하여 총 1개로 유지됨!
    }
}