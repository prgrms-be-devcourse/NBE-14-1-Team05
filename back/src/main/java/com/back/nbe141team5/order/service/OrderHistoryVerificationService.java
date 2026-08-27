package com.back.nbe141team5.order.service;

import com.back.nbe141team5.mail.EmailService;
import com.back.nbe141team5.order.exception.EmailVerificationException;
import com.back.nbe141team5.order.entity.EmailVerification;
import com.back.nbe141team5.order.repository.EmailVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderHistoryVerificationService {

    private final EmailService emailService;
    private final EmailVerificationRepository emailVerificationRepository;

    // 인증번호를 생성해 저장하고(같은 이메일의 기존 인증번호는 제거) 안내 메일을 발송한다.
    @Transactional
    public void sendVerificationEmail(String email) {
        String code = UUID.randomUUID()
                .toString()
                .substring(0, 6);

        String content = verificationCodeContent(code);

        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(5);

        emailVerificationRepository.findByEmail(email)
                .ifPresent(emailVerificationRepository::delete);

        emailVerificationRepository.save(new EmailVerification(email, code, expiresAt));

        emailService.sendEmail(email, "Order Verification Code", content);
    }

    // 인증번호를 검증한다. 인증 정보 없음/만료/불일치 시 EmailVerificationException 을 던진다.
    public void verifyCode(String email, String code) {

        EmailVerification emailVerification = emailVerificationRepository.findByEmail(email)
                .orElseThrow(() -> new EmailVerificationException("인증 정보를 찾을 수 없습니다. 인증번호를 다시 요청해주세요."));

        if (emailVerification.isExpired()) {
            throw new EmailVerificationException("인증번호가 만료되었습니다. 인증번호를 다시 요청해주세요.");
        }

        if (!emailVerification.matches(code)) {
            throw new EmailVerificationException("인증번호가 일치하지 않습니다.");
        }
    }

    // 인증번호 안내 메일의 HTML 본문을 생성한다.
    private String verificationCodeContent(String code) {
        return """
            <div style="
                font-family: Arial, sans-serif;
                max-width: 520px;
                margin: 0 auto;
                padding: 32px;
                background-color: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
            ">
                <h2 style="
                    margin: 0 0 16px;
                    color: #111827;
                    font-size: 24px;
                ">
                    이메일 인증
                </h2>

                <p style="
                    margin: 0 0 24px;
                    color: #4b5563;
                    font-size: 15px;
                    line-height: 1.6;
                ">
                    주문 내역을 조회하기 위한 인증번호입니다.<br>
                    아래 인증번호를 입력해주세요.
                </p>

                <div style="
                    padding: 20px;
                    margin: 24px 0;
                    text-align: center;
                    background-color: #f3f4f6;
                    border-radius: 10px;
                ">
                    <span style="
                        font-size: 32px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        color: #111827;
                    ">
                        %s
                    </span>
                </div>

                <p style="
                    margin: 24px 0 0;
                    color: #6b7280;
                    font-size: 13px;
                    line-height: 1.5;
                ">
                    본인이 요청하지 않은 인증 메일이라면 이 메일을 무시해주세요.
                </p>
            </div>
            """.formatted(code);
    }
}
