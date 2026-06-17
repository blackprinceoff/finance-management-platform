package com.finance.platform.service;

import com.finance.platform.dto.AuthResponse;
import com.finance.platform.dto.LoginRequest;
import com.finance.platform.dto.RegisterRequest;
import com.finance.platform.entity.Role;
import com.finance.platform.entity.User;
import com.finance.platform.entity.UserStatus;
import com.finance.platform.exception.BadRequestException;
import com.finance.platform.exception.UnauthorizedException;
import com.finance.platform.repository.RoleRepository;
import com.finance.platform.repository.UserRepository;
import com.finance.platform.security.JwtUtil;
import com.finance.platform.security.UserPrincipal;
import com.finance.platform.util.RoleConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final AuditLoggingService auditLoggingService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already registered");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new BadRequestException("Username already taken");
        }

        Role defaultRole = roleRepository.findByName(RoleConstants.USER)
                .orElseThrow(() -> new IllegalStateException("Default role not found"));

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .status(UserStatus.ACTIVE)
                .roles(Set.of(defaultRole))
                .build();

        userRepository.save(user);

        auditLoggingService.logAction(user.getId(), "REGISTER");

        String token = jwtUtil.generateToken(UserPrincipal.from(user));
        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UnauthorizedException("User account is locked or disabled");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        String token = jwtUtil.generateToken(UserPrincipal.from(user));
        
        auditLoggingService.logAction(user.getId(), "LOGIN");
        
        return new AuthResponse(token);
    }
}
