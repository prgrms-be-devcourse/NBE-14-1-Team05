package com.back.nbe141team5.order.entity;

import com.back.nbe141team5.product.entity.Product;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "order_items",
        indexes = {
                @Index(name = "idx_order_items_order_id", columnList = "order_id"),
                @Index(name = "idx_order_items_product_id", columnList = "product_id"),
                @Index(name = "idx_order_items_name_qty", columnList = "productName, quantity")
        })
@NoArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String productName;

    private Integer quantity;

    private Integer price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private CoffeeOrder coffeeOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    public OrderItem(Product product, Integer quantity) {
        this.product = product;
        this.productName = product.getName();
        this.quantity = quantity;
        this.price = product.getPrice();
    }

    public void setCoffeeOrder(CoffeeOrder coffeeOrder) {
        this.coffeeOrder = coffeeOrder;
    }

    // 동일한 주문이 있으면 수량을 늘려줄 수 있도록
    public void addQuantity(Integer quantity) {
        this.quantity += quantity;
    }
}
