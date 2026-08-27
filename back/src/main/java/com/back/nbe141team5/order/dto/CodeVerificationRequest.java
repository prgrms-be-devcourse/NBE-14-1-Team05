package com.back.nbe141team5.order.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;


public record CodeVerificationRequest (
        @NotBlank @Email String email,
        @NotBlank String code
) {
}
