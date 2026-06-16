package com.finance.platform.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GoalRequest(
        @Schema(example = "Emergency Fund")
        @NotBlank String name,

        @Schema(example = "10000.00")
        @NotNull @Positive BigDecimal targetAmount,

        @Schema(example = "2500.00")
        BigDecimal currentAmount,

        @Schema(example = "2026-12-31")
        @NotNull LocalDate deadline
) {}
