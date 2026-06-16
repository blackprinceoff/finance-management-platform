package com.finance.platform.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finance.platform.entity.CategoryType;

public record CategoryResponse(
        Long id,
        String name,
        CategoryType type,
        @JsonProperty("isGlobal") boolean isGlobal,
        Long userId
) {}
