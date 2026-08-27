package com.back.nbe141team5.order.repository;

import com.back.nbe141team5.order.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    // 이메일로 인증 정보 조회 (없으면 Optional.empty)
    Optional<EmailVerification> findByEmail(String email);

}
