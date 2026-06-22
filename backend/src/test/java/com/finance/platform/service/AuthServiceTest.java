package com.finance.platform.service;

import com.finance.platform.dto.AuthResponse;
import com.finance.platform.dto.LoginRequest;
import com.finance.platform.entity.Role;
import com.finance.platform.entity.User;
import com.finance.platform.entity.UserStatus;
import com.finance.platform.exception.UnauthorizedException;
import com.finance.platform.repository.UserRepository;
import com.finance.platform.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuditLoggingService auditLoggingService;

    @InjectMocks
    private AuthService authService;

    private LoginRequest loginRequest;
    private User activeUser;
    private User blockedUser;
    private static final String DUMMY_JWT = "eyJhbGciOiJIUzI1NiJ9.dGVzdA.abcdef123456";

    @BeforeEach
    void setUp() {
        loginRequest = new LoginRequest("user@example.com", "Password123!");

        Role userRole = new Role(1L, "ROLE_USER");

        activeUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("user@example.com")
                .password("encodedPassword")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(userRole))
                .build();

        blockedUser = User.builder()
                .id(2L)
                .username("blockeduser")
                .email("user@example.com")
                .password("encodedPassword")
                .status(UserStatus.BLOCKED)
                .roles(Set.of(userRole))
                .build();
    }

    @Test
    void login_Success() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mock(Authentication.class));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(activeUser));
        when(jwtUtil.generateToken(any(UserDetails.class))).thenReturn(DUMMY_JWT);

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals(DUMMY_JWT, response.token());

        verify(authenticationManager, times(1))
                .authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository, times(1)).findByEmail("user@example.com");
        verify(jwtUtil, times(1)).generateToken(any(UserDetails.class));
        verify(auditLoggingService, times(1)).logAction(1L, "LOGIN");
    }

    @Test
    void login_ThrowsException_WhenBadCredentials() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class,
                () -> authService.login(loginRequest));

        verify(userRepository, never()).findByEmail(anyString());
        verify(jwtUtil, never()).generateToken(any(UserDetails.class));
        verify(auditLoggingService, never()).logAction(anyLong(), anyString());
    }

    @Test
    void login_ThrowsException_WhenUserIsBlocked() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mock(Authentication.class));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(blockedUser));

        assertThrows(UnauthorizedException.class,
                () -> authService.login(loginRequest));

        verify(jwtUtil, never()).generateToken(any(UserDetails.class));
        verify(auditLoggingService, never()).logAction(anyLong(), anyString());
    }
}
