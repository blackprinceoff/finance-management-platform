package com.finance.platform.dto;

import java.math.BigDecimal;

public record BudgetResponse(
        Long id,
        BigDecimal amount,
        int month,
        int year,
        Long categoryId,
        String categoryName,
        Long userId
) {}
