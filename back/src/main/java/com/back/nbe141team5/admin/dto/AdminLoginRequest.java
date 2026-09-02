package com.back.nbe141team5.admin.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminLoginRequest(
        @NotBlank(message = "관리자 코드를 입력해주세요.")
        String adminCode
) {
}
