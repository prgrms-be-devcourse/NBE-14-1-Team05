package com.back.nbe141team5.order.repository;

import com.back.nbe141team5.order.entity.CoffeeOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<CoffeeOrder, Long> {
}
