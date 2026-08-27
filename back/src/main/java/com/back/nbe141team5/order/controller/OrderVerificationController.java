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

    // 인증번호 발송: 입력한 이메일로 인증번호를 보내고 저장한다.
    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendVerificationEmail(
            @Valid @RequestBody EmailVerificationRequest request
    ) {
        verificationService.sendVerificationEmail(request.email());
        return ResponseEntity.ok(Map.of("message", "인증번호가 전송되었습니다."));
    }

    // 인증번호 검증: 이메일과 인증번호가 일치하고 만료되지 않았는지 확인한다.
    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyCode(
            @Valid @RequestBody CodeVerificationRequest request
    ) {
        verificationService.verifyCode(request.email(), request.code());
        return ResponseEntity.ok(Map.of("message", "인증번호가 인증되었습니다."));
    }

}
