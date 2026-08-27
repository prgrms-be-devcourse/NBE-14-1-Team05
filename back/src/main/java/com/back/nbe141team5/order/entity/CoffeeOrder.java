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

    // deliveryDate 를 포함하는 생성자 추가
    public CoffeeOrder(String email, String address, String postcode, Integer totalPrice, LocalDateTime orderDate, OrderStatus status, LocalDateTime deliveryDate) {
        validatePostcode(postcode);
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

    // 1. 상태 전이 가능 여부 검증
    private boolean canChangeTo(OrderStatus newStatus) {
        if (this.status == newStatus) {
            return true;
        }
        return switch (this.status) {
            // ORDERED 상태일 때: 배송중(SHIPPED) 뿐만 아니라 주문취소(CANCELLED)도 가능하도록 추가
            case ORDERED -> newStatus == OrderStatus.SHIPPED || newStatus == OrderStatus.CANCELLED;
            // SHIPPED 상태일 때: 배송완료(DELIVERED) 뿐만 아니라 주문취소(CANCELLED)도 가능하도록 추가
            case SHIPPED -> newStatus == OrderStatus.DELIVERED;
            // 이미 배송완료(DELIVERED)되었거나 취소(CANCELLED)된 주문은 더 이상 변경 불가
            case DELIVERED, CANCELLED -> false;
        };
    }

    // 2. 주문 취소 메서드 (안전하게 updateStatus를 호출하도록 수정)
    public void cancel() {
        this.updateStatus(OrderStatus.CANCELLED);
    }

    // 배송지 및 우편번호 수정
    public void updateDeliveryInfo(String address, String postcode) {

        if(this.status != OrderStatus.ORDERED) {
            throw new IllegalArgumentException("주문 완료 상태일 때만 배송지를 변경할 수 있습니다.");
        }
        if (address == null || address.isBlank()) {
            throw new IllegalArgumentException("배송지 주소는 필수입니다.");
        }

        validatePostcode(postcode);
        this.address = address;
        this.postcode = postcode;
    }

    // 우편번호 5자리 이하의 숫자 유효성 검증 메서드
    private void validatePostcode(String postcode) {
        if (postcode == null || !postcode.matches("^\\d{5}$")) {
            throw new IllegalArgumentException("우편번호는 5자리의 숫자여야 합니다.");
        }
    }
}
