package com.finance.platform.repository;

import com.finance.platform.entity.Income;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface IncomeRepository extends JpaRepository<Income, Long> {

    List<Income> findByUserId(Long userId);

    Optional<Income> findByIdAndUserId(Long id, Long userId);

    List<Income> findByUserIdAndCategoryId(Long userId, Long categoryId);
}
