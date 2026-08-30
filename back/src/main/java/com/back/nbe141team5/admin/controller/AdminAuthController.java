package com.back.nbe141team5.admin.controller;

import com.back.nbe141team5.admin.dto.AdminLoginRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/auth")
public class AdminAuthController {

    @Value("${admin.code}")
    private String adminCode;

    // 관리자 로그인
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @Valid @RequestBody AdminLoginRequest request,
            HttpSession session
    ) {
        if (!adminCode.equals(request.adminCode())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "관리자 코드가 올바르지 않습니다."));
        }

        session.setAttribute("isAdmin", true);
        return ResponseEntity.ok(Map.of("message", "관리자 인증 성공"));
    }

    // 관리자 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpSession session) {
        session.removeAttribute("isAdmin");
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "로그아웃 되었습니다."));
    }

    // 관리자 인증 상태 확인
    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> checkStatus(HttpSession session) {
        boolean isAuthenticated = Boolean.TRUE.equals(session.getAttribute("isAdmin"));
        return ResponseEntity.ok(Map.of("authenticated", isAuthenticated));
    }
}
