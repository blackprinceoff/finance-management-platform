package com.finance.platform.repository;

import com.finance.platform.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Page<User> findByEmailContainingIgnoreCase(String email, Pageable pageable);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}
