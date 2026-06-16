package com.finance.platform.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.finance.platform.entity.CategoryType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CategoryRequest(
        @Schema(example = "Groceries")
        @NotBlank String name,

        @Schema(example = "EXPENSE")
        @NotNull CategoryType type,

        @Schema(example = "false")
        @JsonProperty("isGlobal") boolean isGlobal
) {}
