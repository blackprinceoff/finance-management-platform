package com.finance.platform.dto.analytics;

import java.math.BigDecimal;

public record BudgetProgressResponse(
        String categoryName,
        BigDecimal budgetAmount,
        BigDecimal spentAmount,
        BigDecimal remainingAmount,
        boolean isExceeded
) {}
