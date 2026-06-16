package com.finance.platform.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseResponse(
        Long id,
        BigDecimal amount,
        String description,
        LocalDate date,
        Long categoryId,
        String categoryName,
        Long userId
) {}
