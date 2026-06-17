package com.finance.platform.dto.admin;

import java.time.LocalDateTime;

public record AuditLogResponse(
        Long id,
        Long userId,
        String action,
        LocalDateTime timestamp,
        String ipAddress
) {}
