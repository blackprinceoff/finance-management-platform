package com.finance.platform.repository;

import com.finance.platform.entity.Goal;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GoalRepository extends JpaRepository<Goal, Long> {

    @EntityGraph(attributePaths = {"user"})
    List<Goal> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"user"})
    Optional<Goal> findByIdAndUserId(Long id, Long userId);
}
