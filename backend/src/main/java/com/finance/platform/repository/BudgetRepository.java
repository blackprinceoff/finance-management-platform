package com.finance.platform.repository;

import com.finance.platform.entity.Budget;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    @EntityGraph(attributePaths = {"category", "user"})
    List<Budget> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"category", "user"})
    Optional<Budget> findByIdAndUserId(Long id, Long userId);

    @EntityGraph(attributePaths = {"category", "user"})
    List<Budget> findByUserIdAndMonthAndYear(Long userId, int month, int year);
}
