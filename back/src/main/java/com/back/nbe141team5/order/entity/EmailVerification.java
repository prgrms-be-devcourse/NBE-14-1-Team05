package com.back.nbe141team5.order.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
public class EmailVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    public EmailVerification(
            String email,
            String code,
            LocalDateTime expiresAt
    ) {
        this.email = email;
        this.code = code;
        this.expiresAt = expiresAt;
    }

    // 만료 시각이 현재 시각을 지났는지 여부
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    // 입력된 인증번호가 저장된 인증번호와 일치하는지 여부
    public boolean matches(String code) {
        return this.code.equals(code);
    }
}
