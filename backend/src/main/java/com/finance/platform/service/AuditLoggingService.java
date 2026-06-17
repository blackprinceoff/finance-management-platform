package com.finance.platform.service;

import com.finance.platform.entity.AuditLog;
import com.finance.platform.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditLoggingService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(Long userId, String action) {
        String ipAddress = "SYSTEM";
        
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            HttpServletRequest request = attributes.getRequest();
            ipAddress = resolveClientIp(request);
        }

        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .action(action)
                .timestamp(LocalDateTime.now())
                .ipAddress(ipAddress)
                .build();

        auditLogRepository.save(auditLog);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            String firstIp = xForwardedFor.split(",")[0].trim();
            if (!firstIp.isEmpty() && !"unknown".equalsIgnoreCase(firstIp)) {
                return firstIp;
            }
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp.trim();
        }

        return request.getRemoteAddr();
    }
}
