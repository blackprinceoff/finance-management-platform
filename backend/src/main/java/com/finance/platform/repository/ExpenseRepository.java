package com.finance.platform.repository;

import com.finance.platform.entity.Expense;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @EntityGraph(attributePaths = {"category", "user"})
    List<Expense> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"category", "user"})
    Optional<Expense> findByIdAndUserId(Long id, Long userId);

    @EntityGraph(attributePaths = {"category", "user"})
    List<Expense> findByUserIdAndCategoryId(Long userId, Long categoryId);
}
