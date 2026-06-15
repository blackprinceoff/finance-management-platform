package com.finance.platform.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
        @Schema(example = "testuser")
        @NotBlank String username,

        @Schema(example = "test@apple.com")
        @Email @NotBlank String email,

        @Schema(example = "Password123!")
        @NotBlank String password
) {}
