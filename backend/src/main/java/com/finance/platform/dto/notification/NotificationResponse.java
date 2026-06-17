package com.finance.platform.dto.notification;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String message,
        @JsonProperty("isRead") boolean isRead,
        LocalDateTime createdAt
) {}
