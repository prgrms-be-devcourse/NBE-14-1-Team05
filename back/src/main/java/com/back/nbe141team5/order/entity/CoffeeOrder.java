package com.back.nbe141team5.order.entity;

import com.back.nbe141team5.global.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "orders")
@NoArgsConstructor
public class CoffeeOrder extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    private LocalDateTime orderDate;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private Integer totalPrice;

    private LocalDateTime deliveryDate;

    @OneToMany(mappedBy = "coffeeOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    public CoffeeOrder(String email, Integer totalPrice, LocalDateTime orderDate, OrderStatus status) {
        this.email = email;
        this.totalPrice = totalPrice;
        this.orderDate = orderDate;
        this.status = status;
    }

    public void addOrderItem(OrderItem orderItem) {
        this.orderItems.add(orderItem);
        orderItem.setCoffeeOrder(this);
    }
    public void updateTotalPrice(Integer totalPrice) {
        this.totalPrice = totalPrice;
    }
}
