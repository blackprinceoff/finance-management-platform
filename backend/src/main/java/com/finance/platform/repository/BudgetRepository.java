package com.finance.platform.repository;

import com.finance.platform.entity.Budget;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    @EntityGraph(attributePaths = {"category", "user"})
    List<Budget> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"category", "user"})
    Optional<Budget> findByIdAndUserId(Long id, Long userId);

    @EntityGraph(attributePaths = {"category", "user"})
    List<Budget> findByUserIdAndMonthAndYear(Long userId, int month, int year);

    boolean existsByUserIdAndCategoryIdAndMonthAndYear(Long userId, Long categoryId, int month, int year);

    boolean existsByCategoryId(Long categoryId);

    interface ExceededBudgetInfo {
        Long getUserId();
        String getCategoryName();
    }

    @Query("""
        SELECT b.user.id as userId, b.category.name as categoryName
        FROM Budget b
        JOIN Expense e ON e.user.id = b.user.id 
            AND e.category.id = b.category.id 
            AND e.date >= :startDate AND e.date <= :endDate
        WHERE b.month = :month AND b.year = :year
        GROUP BY b.user.id, b.category.name, b.amount
        HAVING SUM(e.amount) > b.amount
    """)
    List<ExceededBudgetInfo> findExceededBudgets(
            @org.springframework.data.repository.query.Param("month") int month, 
            @org.springframework.data.repository.query.Param("year") int year, 
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate, 
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate);
}
