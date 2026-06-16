package com.finance.platform.repository;

import com.finance.platform.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("SELECT c FROM Category c WHERE c.user.id = :userId OR c.isGlobal = true")
    List<Category> findByUserIdOrIsGlobal(@Param("userId") Long userId);

    Optional<Category> findByIdAndUserId(Long id, Long userId);
}
