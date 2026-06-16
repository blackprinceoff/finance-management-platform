package com.finance.platform.repository;

import com.finance.platform.entity.Income;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IncomeRepository extends JpaRepository<Income, Long> {

    @EntityGraph(attributePaths = {"category", "user"})
    List<Income> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"category", "user"})
    Optional<Income> findByIdAndUserId(Long id, Long userId);

    @EntityGraph(attributePaths = {"category", "user"})
    List<Income> findByUserIdAndCategoryId(Long userId, Long categoryId);
}
