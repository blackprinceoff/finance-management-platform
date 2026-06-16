package com.finance.platform.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record IncomeRequest(
        @Schema(example = "2500.00")
        @NotNull @Positive BigDecimal amount,

        @Schema(example = "Monthly salary")
        String description,

        @Schema(example = "2026-06-01")
        @NotNull LocalDate date,

        @Schema(example = "2")
        @NotNull Long categoryId
) {}
