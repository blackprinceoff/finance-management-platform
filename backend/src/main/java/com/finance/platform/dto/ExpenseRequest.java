package com.finance.platform.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseRequest(
        @Schema(example = "99.99")
        @NotNull @Positive BigDecimal amount,

        @Schema(example = "Weekly grocery shopping")
        String description,

        @Schema(example = "2026-06-15")
        @NotNull LocalDate date,

        @Schema(example = "1")
        @NotNull Long categoryId
) {}
