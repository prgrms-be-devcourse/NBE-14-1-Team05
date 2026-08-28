package com.back.nbe141team5.global.exception;

import com.back.nbe141team5.mail.MailSendException;
import com.back.nbe141team5.order.exception.EmailVerificationException;
import com.back.nbe141team5.product.exception.ProductNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<String> handleProductNotFound(
            ProductNotFoundException e
    ) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(e.getMessage());
    }

    // 이메일 인증 실패(인증 정보 없음/만료/불일치) → 400
    @ExceptionHandler(EmailVerificationException.class)
    public ResponseEntity<String> handleEmailVerification(
            EmailVerificationException e
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());
    }

    // 메일 발송 실패 → 502 (수신자 노출 방지를 위해 고정 문구 반환)
    @ExceptionHandler(MailSendException.class)
    public ResponseEntity<String> handleMailSend(
            MailSendException e
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_GATEWAY)
                .body("메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
}
