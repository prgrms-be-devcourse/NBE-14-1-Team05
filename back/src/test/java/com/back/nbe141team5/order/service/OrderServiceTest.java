package com.back.nbe141team5.order.service;

import com.back.nbe141team5.order.dto.OrderItemRequest;
import com.back.nbe141team5.order.dto.OrderCreateRequest;
import com.back.nbe141team5.order.entity.CoffeeOrder;
import com.back.nbe141team5.order.entity.OrderItem;
import com.back.nbe141team5.order.entity.OrderStatus;
import com.back.nbe141team5.order.repository.OrderRepository;
import com.back.nbe141team5.product.entity.Product;
import com.back.nbe141team5.product.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ProductRepository productRepository;
    @InjectMocks
    private OrderService orderService;

    @Test
    @DisplayName("기존 주문이 없는 경우 새로운 주문이 정상적으로 생성된다.")
    void createNewOrder_success() {
        // given
        String email = "test@example.com";
        String address = "서울시 강남구";
        String postcode = "12345";
        OrderCreateRequest request = new OrderCreateRequest(
                email, address, postcode,
                List.of(new OrderItemRequest(1L, 2))
        );
        Product product = createProduct(1L, "콜롬비아 원두", 10000);
        given(productRepository.findById(1L)).willReturn(Optional.of(product));
        given(orderRepository.findTopByEmailAndStatusOrderByOrderDateDesc(email, OrderStatus.ORDERED))
                .willReturn(Optional.empty());
        CoffeeOrder savedOrder = new CoffeeOrder(email, address, postcode, 20000, LocalDateTime.now(), OrderStatus.ORDERED, LocalDateTime.now().plusDays(1));
        ReflectionTestUtils.setField(savedOrder, "id", 100L);
        given(orderRepository.save(any(CoffeeOrder.class))).willReturn(savedOrder);
        // when
        Long orderId = orderService.createOrder(request);
        // then
        assertThat(orderId).isEqualTo(100L);
        verify(orderRepository).save(any(CoffeeOrder.class));
    }

    @Test
    @DisplayName("동일 이메일, 동일 배송지, 동일 배송 그룹 주문인 경우 기존 주문에 상품 수량이 병합된다.")
    void mergeOrder_sameProduct_success() {
        // given
        String email = "test@example.com";
        String address = "서울시 강남구";
        String postcode = "12345";
        LocalDateTime sameGroupOrderTime = LocalDateTime.now(); // 같은 주기 시간
        Product product = createProduct(1L, "콜롬비아 원두", 10000);
        // 기존 주문 (100번 주문, 이미 콜롬비아 원두 2개 담김, 총 20,000원)
        CoffeeOrder existingOrder = new CoffeeOrder(email, address, postcode, 20000, sameGroupOrderTime, OrderStatus.ORDERED, sameGroupOrderTime.plusDays(1));
        ReflectionTestUtils.setField(existingOrder, "id", 100L);
        existingOrder.addOrderItem(new OrderItem(product, 2));
        given(orderRepository.findTopByEmailAndStatusOrderByOrderDateDesc(email, OrderStatus.ORDERED))
                .willReturn(Optional.of(existingOrder));
        given(productRepository.findById(1L)).willReturn(Optional.of(product));
        // 신규 주문 요청 (동일 상품 3개 추가 주문)
        OrderCreateRequest request = new OrderCreateRequest(
                email, address, postcode,
                List.of(new OrderItemRequest(1L, 3))
        );
        // when
        Long orderId = orderService.createOrder(request);
        // then
        assertThat(orderId).isEqualTo(100L); // 기존 주문 ID 반환
        assertThat(existingOrder.getTotalPrice()).isEqualTo(50000); // 20,000 + (10,000 * 3)
        assertThat(existingOrder.getOrderItems().get(0).getQuantity()).isEqualTo(5); // 2 + 3 = 5개
    }

    @Test
    @DisplayName("동일 배송 그룹이지만 배송지가 다른 경우 합배송되지 않고 신규 주문으로 생성된다.")
    void createNewOrder_whenDifferentAddress() {
        // given
        String email = "test@example.com";
        LocalDateTime sameGroupOrderTime = LocalDateTime.now();
        // 기존 주문 (서울시 강남구)
        CoffeeOrder existingOrder = new CoffeeOrder(email, "서울시 강남구", "12345", 20000, sameGroupOrderTime, OrderStatus.ORDERED, sameGroupOrderTime.plusDays(1));
        ReflectionTestUtils.setField(existingOrder, "id", 100L);
        given(orderRepository.findTopByEmailAndStatusOrderByOrderDateDesc(email, OrderStatus.ORDERED))
                .willReturn(Optional.of(existingOrder));
        Product product = createProduct(1L, "콜롬비아 원두", 10000);
        given(productRepository.findById(1L)).willReturn(Optional.of(product));
        // 신규 주문 요청 (부산시 해운대구 - 다른 배송지)
        OrderCreateRequest request = new OrderCreateRequest(
                email, "부산시 해운대구", "54321",
                List.of(new OrderItemRequest(1L, 1))
        );
        CoffeeOrder newOrder = new CoffeeOrder(email, "부산시 해운대구", "54321", 10000, LocalDateTime.now(), OrderStatus.ORDERED, LocalDateTime.now().plusDays(1));
        ReflectionTestUtils.setField(newOrder, "id", 200L);
        given(orderRepository.save(any(CoffeeOrder.class))).willReturn(newOrder);
        // when
        Long orderId = orderService.createOrder(request);
        // then
        assertThat(orderId).isEqualTo(200L); // 신규 주문 ID 반환
        verify(orderRepository).save(any(CoffeeOrder.class));
    }

    @Test
    @DisplayName("동일 배송지이지만 배송 처리 주기(14시 기준)가 다른 경우 신규 주문으로 생성된다.")
    void createNewOrder_whenDifferentDeliveryGroup() {
        // given
        String email = "test@example.com";
        String address = "서울시 강남구";
        String postcode = "12345";
        // 기존 주문 (어제 10시 주문 -> 이미 지난 배송 그룹)
        LocalDateTime pastOrderTime = LocalDateTime.now().minusDays(2);
        CoffeeOrder existingOrder = new CoffeeOrder(email, address, postcode, 20000, pastOrderTime, OrderStatus.ORDERED, pastOrderTime.plusDays(1));
        ReflectionTestUtils.setField(existingOrder, "id", 100L);
        given(orderRepository.findTopByEmailAndStatusOrderByOrderDateDesc(email, OrderStatus.ORDERED))
                .willReturn(Optional.of(existingOrder));
        Product product = createProduct(1L, "콜롬비아 원두", 10000);
        given(productRepository.findById(1L)).willReturn(Optional.of(product));
        OrderCreateRequest request = new OrderCreateRequest(
                email, address, postcode,
                List.of(new OrderItemRequest(1L, 1))
        );
        CoffeeOrder newOrder = new CoffeeOrder(email, address, postcode, 10000, LocalDateTime.now(), OrderStatus.ORDERED, LocalDateTime.now().plusDays(1));
        ReflectionTestUtils.setField(newOrder, "id", 300L);
        given(orderRepository.save(any(CoffeeOrder.class))).willReturn(newOrder);
        // when
        Long orderId = orderService.createOrder(request);
        // then
        assertThat(orderId).isEqualTo(300L); // 신규 주문 ID 반환
        verify(orderRepository).save(any(CoffeeOrder.class));
    }

    // Helper: 테스트용 Product 생성
    private Product createProduct(Long id, String name, Integer price) {
        Product product = new Product(name, price, "설명", "image.png");
        ReflectionTestUtils.setField(product, "id", id);
        return product;
    }
}