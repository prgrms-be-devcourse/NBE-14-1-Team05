package com.back.nbe141team5.order.controller;

import com.back.nbe141team5.order.dto.CodeVerificationRequest;
import com.back.nbe141team5.order.dto.EmailVerificationRequest;
import com.back.nbe141team5.order.service.OrderHistoryVerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/verification")
public class OrderVerificationController {

    private final OrderHistoryVerificationService verificationService;

    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendVerificationEmail(
            @Valid @RequestBody EmailVerificationRequest request
    ) {
        verificationService.sendVerificationEmail(request.email());
        return ResponseEntity.ok(Map.of("message", "인증번호가 전송되었습니다."));
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyCode(
            @Valid @RequestBody CodeVerificationRequest request
    ) {
        verificationService.verifyCode(request.email(), request.code());
        return ResponseEntity.ok(Map.of("message", "인증번호가 인증되었습니다."));
    }

}
