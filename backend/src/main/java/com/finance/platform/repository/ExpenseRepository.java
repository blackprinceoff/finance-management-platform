package com.finance.platform.repository;

import com.finance.platform.entity.Expense;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @EntityGraph(attributePaths = {"category", "user"})
    List<Expense> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"category", "user"})
    Page<Expense> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "user"})
    Optional<Expense> findByIdAndUserId(Long id, Long userId);

    @EntityGraph(attributePaths = {"category", "user"})
    List<Expense> findByUserIdAndCategoryId(Long userId, Long categoryId);

    @EntityGraph(attributePaths = {"category", "user"})
    Page<Expense> findByUserIdAndCategoryId(Long userId, Long categoryId, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "user"})
    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId AND MONTH(e.date) = :month AND YEAR(e.date) = :year")
    List<Expense> findByUserIdAndMonthAndYear(@Param("userId") Long userId, @Param("month") int month, @Param("year") int year);

    boolean existsByCategoryId(Long categoryId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e " +
           "WHERE e.user.id = :userId AND MONTH(e.date) = :month AND YEAR(e.date) = :year")
    BigDecimal sumByUserIdAndMonthAndYear(@Param("userId") Long userId,
                                          @Param("month") int month,
                                          @Param("year") int year);

    interface CategorySpending {
        Long getCategoryId();
        BigDecimal getTotalSpent();
    }

    @Query("SELECT e.category.id as categoryId, COALESCE(SUM(e.amount), 0) as totalSpent " +
           "FROM Expense e " +
           "WHERE e.user.id = :userId AND MONTH(e.date) = :month AND YEAR(e.date) = :year " +
           "GROUP BY e.category.id")
    List<CategorySpending> sumByCategoryForUserAndMonth(@Param("userId") Long userId,
                                                        @Param("month") int month,
                                                        @Param("year") int year);
}
