package com.finance.platform.dto;

import com.finance.platform.entity.CategoryType;

public record CategoryResponse(
        Long id,
        String name,
        CategoryType type,
        boolean isGlobal,
        Long userId
) {}
