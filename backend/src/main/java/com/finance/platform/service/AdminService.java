package com.finance.platform.service;

import com.finance.platform.dto.admin.AuditLogResponse;
import com.finance.platform.dto.admin.UserDTO;
import com.finance.platform.entity.AuditLog;
import com.finance.platform.entity.User;
import com.finance.platform.entity.UserStatus;
import com.finance.platform.exception.ResourceNotFoundException;
import com.finance.platform.repository.AuditLogRepository;
import com.finance.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import com.finance.platform.security.UserPrincipal;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuditLoggingService auditLoggingService;

    public Page<UserDTO> getAllUsers(int page, int size, String email) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
        if (email != null && !email.isBlank()) {
            return userRepository.findByEmailContainingIgnoreCase(email, pageable).map(this::toUserDTO);
        }
        return userRepository.findAll(pageable).map(this::toUserDTO);
    }

    @Transactional
    public void blockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setStatus(UserStatus.BLOCKED);
        userRepository.save(user);

        UserPrincipal adminPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        auditLoggingService.logAction(adminPrincipal.getId(), "BLOCKED_USER_" + userId);
    }

    @Transactional
    public void unblockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        UserPrincipal adminPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        auditLoggingService.logAction(adminPrincipal.getId(), "UNBLOCKED_USER_" + userId);
    }

    public Page<AuditLogResponse> getAuditLogs(LocalDateTime startDate, LocalDateTime endDate, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));

        Page<AuditLog> auditLogPage = (startDate != null && endDate != null)
                ? auditLogRepository.findByTimestampBetween(startDate, endDate, pageable)
                : auditLogRepository.findAll(pageable);

        return auditLogPage.map(this::toAuditLogResponse);
    }

    private UserDTO toUserDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getStatus(),
                user.getRoles().stream()
                        .map(role -> role.getName())
                        .collect(Collectors.toSet()));
    }

    private AuditLogResponse toAuditLogResponse(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getUserId(),
                log.getAction(),
                log.getTimestamp(),
                log.getIpAddress());
    }
}
