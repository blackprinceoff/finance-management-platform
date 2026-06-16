package com.finance.platform.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record BudgetRequest(
        @Schema(example = "1500.00")
        @NotNull @Positive BigDecimal amount,

        @Schema(example = "6")
        @Min(1) @Max(12) int month,

        @Schema(example = "2026")
        int year,

        @Schema(example = "1")
        @NotNull Long categoryId
) {}
