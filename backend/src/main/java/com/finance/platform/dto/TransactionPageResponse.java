package com.finance.platform.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.List;

public record TransactionPageResponse<T>(
    List<T> content,
    int totalPages,
    long totalElements,
    int number,
    int size,
    boolean first,
    @JsonProperty("last") boolean last,
    BigDecimal totalSum
) {}