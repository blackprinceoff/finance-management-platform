package com.finance.platform.repository;

import com.finance.platform.entity.Income;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IncomeRepository extends JpaRepository<Income, Long> {

    @EntityGraph(attributePaths = {"category", "user"})
    List<Income> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"category", "user"})
    Page<Income> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "user"})
    Optional<Income> findByIdAndUserId(Long id, Long userId);

    @EntityGraph(attributePaths = {"category", "user"})
    List<Income> findByUserIdAndCategoryId(Long userId, Long categoryId);

    @EntityGraph(attributePaths = {"category", "user"})
    Page<Income> findByUserIdAndCategoryId(Long userId, Long categoryId, Pageable pageable);

    @EntityGraph(attributePaths = {"category", "user"})
    @Query("SELECT i FROM Income i WHERE i.user.id = :userId AND MONTH(i.date) = :month AND YEAR(i.date) = :year")
    List<Income> findByUserIdAndMonthAndYear(@Param("userId") Long userId, @Param("month") int month, @Param("year") int year);

    boolean existsByCategoryId(Long categoryId);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i " +
           "WHERE i.user.id = :userId AND MONTH(i.date) = :month AND YEAR(i.date) = :year")
    BigDecimal sumByUserIdAndMonthAndYear(@Param("userId") Long userId,
                                          @Param("month") int month,
                                          @Param("year") int year);
}
