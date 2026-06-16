package com.finance.platform.dto.admin;

import com.finance.platform.entity.UserStatus;

import java.util.Set;

public record UserDTO(
        Long id,
        String username,
        String email,
        UserStatus status,
        Set<String> roles
) {}
