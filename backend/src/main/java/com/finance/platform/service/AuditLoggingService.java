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
            String xfHeader = request.getHeader("X-Forwarded-For");
            if (xfHeader == null) {
                ipAddress = request.getRemoteAddr();
            } else {
                ipAddress = xfHeader.split(",")[0];
            }
        }

        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .action(action)
                .timestamp(LocalDateTime.now())
                .ipAddress(ipAddress)
                .build();

        auditLogRepository.save(auditLog);
    }
}
