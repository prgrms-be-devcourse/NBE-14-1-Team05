package com.back.nbe141team5.order.entity;

import com.back.nbe141team5.global.BaseEntity;
import com.back.nbe141team5.product.entity.Product;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Getter
@Table(name = "orders")
@NoArgsConstructor
public class CoffeeOrder extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    private String address;

    private String postcode;

    private LocalDateTime orderDate;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private Integer totalPrice;

    private LocalDateTime deliveryDate;

    @OneToMany(mappedBy = "coffeeOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    public CoffeeOrder(String email, String address, String postcode, Integer totalPrice, LocalDateTime orderDate, OrderStatus status) {
        this.email = email;
        this.address = address;
        this.postcode = postcode;
        this.totalPrice = totalPrice;
        this.orderDate = orderDate;
        this.status = status;
    }

    // deliveryDate 를 포함하는 생성자 추가
    public CoffeeOrder(String email, String address, String postcode, Integer totalPrice, LocalDateTime orderDate, OrderStatus status, LocalDateTime deliveryDate) {
        this.email = email;
        this.address = address;
        this.postcode = postcode;
        this.totalPrice = totalPrice;
        this.orderDate = orderDate;
        this.status = status;
        this.deliveryDate = deliveryDate;
    }

    public void addOrderItem(OrderItem orderItem) {
        this.orderItems.add(orderItem);
        orderItem.setCoffeeOrder(this);
    }

    public void updateTotalPrice(Integer totalPrice) {
        this.totalPrice = totalPrice;
    }

    public void addOrUpdateOrderItem(Product product, Integer quantity) {
        this.orderItems.stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst()
                .ifPresentOrElse(
                        // 1. 이미 존재하면 수량 누적
                        item -> item.addQuantity(quantity),
                        // 2. 없으면 새로 생성해서 추가
                        () -> this.addOrderItem(new OrderItem(product, quantity))
                );

    }

    public boolean isSameAddress(String address, String postcode) {
        return Objects.equals(this.address, address)
                && Objects.equals(this.postcode, postcode);
    }

    // 주문 상태 변경 및 유효성 검증
    public void updateStatus(OrderStatus newStatus) {
        if (newStatus == null) {
            throw new IllegalArgumentException("변경할 주문 상태는 필수입니다.");
        }

        if (!canChangeTo(newStatus)) {
            throw new IllegalStateException(
                    String.format("주문 상태를 %s에서 %s로 변경할 수 없습니다.", this.status, newStatus));
        }

        this.status = newStatus;
    }

    private boolean canChangeTo(OrderStatus newStatus) {
        if (this.status == newStatus) {
            return true;
        }

        return switch (this.status) {
            case ORDERED -> newStatus == OrderStatus.SHIPPED;
            case SHIPPED -> newStatus == OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
    }
    // 주문 취소 (상태 변경)
    public void cancel() {
        this.status = OrderStatus.CANCELLED;
    }

    // 배송지 및 우편번호 수정
    public void updateDeliveryInfo(String address, String postcode) {
        this.address = address;
        this.postcode = postcode;
    }
}
