package com.finance.platform.security;

import com.finance.platform.entity.User;
import com.finance.platform.entity.UserStatus;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

/**
 * A dedicated Spring Security principal that is decoupled from the JPA {@link User} entity.
 * This satisfies the Single Responsibility Principle: the {@code User} entity handles
 * persistence, while {@code UserPrincipal} handles authentication and authorization.
 */
@Getter
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final String password;
    private final UserStatus status;
    private final Collection<? extends GrantedAuthority> authorities;

    private UserPrincipal(Long id, String email, String password,
                          UserStatus status,
                          Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.status = status;
        this.authorities = authorities;
    }

    /**
     * Factory method that converts a JPA {@link User} entity into a security principal.
     * This should be called at the authentication boundary (e.g., in {@link CustomUserDetailsService}).
     */
    public static UserPrincipal from(User user) {
        Collection<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .toList();

        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                user.getStatus(),
                authorities
        );
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return status == UserStatus.ACTIVE;
    }

    /**
     * Checks if this principal has the given role authority.
     *
     * @param roleName the role name (e.g., "ROLE_ADMIN")
     * @return true if the principal has the specified role
     */
    public boolean hasRole(String roleName) {
        return authorities.stream()
                .anyMatch(auth -> auth.getAuthority().equals(roleName));
    }
}
