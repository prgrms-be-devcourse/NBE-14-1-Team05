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

    @ExceptionHandler(EmailVerificationException.class)
    public ResponseEntity<String> handleEmailVerification(
            EmailVerificationException e
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());
    }

    @ExceptionHandler(MailSendException.class)
    public ResponseEntity<String> handleMailSend(
            MailSendException e
    ) {
        return ResponseEntity
                .status(HttpStatus.BAD_GATEWAY)
                .body("메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
}
