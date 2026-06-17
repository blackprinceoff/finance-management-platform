package com.finance.platform.service;

import com.finance.platform.dto.admin.UserDTO;
import com.finance.platform.entity.AuditLog;
import com.finance.platform.entity.User;
import com.finance.platform.entity.UserStatus;
import com.finance.platform.exception.ResourceNotFoundException;
import com.finance.platform.repository.AuditLogRepository;
import com.finance.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import com.finance.platform.security.UserPrincipal;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuditLoggingService auditLoggingService;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserDTO)
                .toList();
    }

    @Transactional
    public void blockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setStatus(UserStatus.BLOCKED);
        userRepository.save(user);

        UserPrincipal adminPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        auditLoggingService.logAction(adminPrincipal.getId(), "BLOCKED_USER_" + userId);
    }

    @Transactional
    public void unblockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        UserPrincipal adminPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        auditLoggingService.logAction(adminPrincipal.getId(), "UNBLOCKED_USER_" + userId);
    }

    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    private UserDTO toUserDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getStatus(),
                user.getRoles().stream()
                        .map(role -> role.getName())
                        .collect(Collectors.toSet())
        );
    }
}
