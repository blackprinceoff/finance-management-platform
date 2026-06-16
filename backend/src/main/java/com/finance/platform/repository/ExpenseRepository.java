package com.finance.platform.repository;

import com.finance.platform.entity.Expense;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @EntityGraph(attributePaths = {"category", "user"})
    List<Expense> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"category", "user"})
    Optional<Expense> findByIdAndUserId(Long id, Long userId);

    @EntityGraph(attributePaths = {"category", "user"})
    List<Expense> findByUserIdAndCategoryId(Long userId, Long categoryId);

    @EntityGraph(attributePaths = {"category", "user"})
    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId AND MONTH(e.date) = :month AND YEAR(e.date) = :year")
    List<Expense> findByUserIdAndMonthAndYear(@Param("userId") Long userId, @Param("month") int month, @Param("year") int year);
}
