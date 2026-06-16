package com.finance.platform.config;

import com.finance.platform.entity.Role;
import com.finance.platform.entity.User;
import com.finance.platform.entity.UserStatus;
import com.finance.platform.repository.RoleRepository;
import com.finance.platform.repository.UserRepository;
import com.finance.platform.util.RoleConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Override
    public void run(String... args) {
        initRoles();
        initAdmin();
    }

    private void initRoles() {
        if (roleRepository.findByName(RoleConstants.USER).isEmpty()) {
            roleRepository.save(new Role(null, RoleConstants.USER));
        }
        if (roleRepository.findByName(RoleConstants.ADMIN).isEmpty()) {
            roleRepository.save(new Role(null, RoleConstants.ADMIN));
        }
    }

    private void initAdmin() {
        if (userRepository.findByEmail(adminEmail).isPresent()) {
            return;
        }

        Role adminRole = roleRepository.findByName(RoleConstants.ADMIN)
                .orElseThrow(() -> new IllegalStateException("ROLE_ADMIN not found"));

        User admin = User.builder()
                .username(adminUsername)
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .status(UserStatus.ACTIVE)
                .roles(Set.of(adminRole))
                .build();

        userRepository.save(admin);
    }
}
