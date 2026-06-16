package com.finance.platform.service;

import com.finance.platform.dto.BudgetRequest;
import com.finance.platform.dto.BudgetResponse;
import com.finance.platform.entity.Budget;
import com.finance.platform.entity.Category;
import com.finance.platform.entity.User;
import com.finance.platform.exception.ResourceNotFoundException;
import com.finance.platform.exception.UnauthorizedException;
import com.finance.platform.repository.BudgetRepository;
import com.finance.platform.repository.CategoryRepository;
import com.finance.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<BudgetResponse> getAllBudgets(Long userId) {
        return budgetRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public BudgetResponse getBudgetById(Long id, Long userId) {
        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", id));
        return toResponse(budget);
    }

    @Transactional
    public BudgetResponse createBudget(BudgetRequest request, Long userId) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.categoryId()));

        if (!category.isGlobal() && !category.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You cannot use this category");
        }

        User userRef = userRepository.getReferenceById(userId);

        Budget budget = Budget.builder()
                .amount(request.amount())
                .month(request.month())
                .year(request.year())
                .category(category)
                .user(userRef)
                .build();

        return toResponse(budgetRepository.save(budget));
    }

    @Transactional
    public BudgetResponse updateBudget(Long id, BudgetRequest request, Long userId) {
        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", id));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.categoryId()));

        if (!category.isGlobal() && !category.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You cannot use this category");
        }

        budget.setAmount(request.amount());
        budget.setMonth(request.month());
        budget.setYear(request.year());
        budget.setCategory(category);

        return toResponse(budgetRepository.save(budget));
    }

    @Transactional
    public void deleteBudget(Long id, Long userId) {
        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", "id", id));
        budgetRepository.delete(budget);
    }

    private BudgetResponse toResponse(Budget budget) {
        return new BudgetResponse(
                budget.getId(),
                budget.getAmount(),
                budget.getMonth(),
                budget.getYear(),
                budget.getCategory().getId(),
                budget.getCategory().getName(),
                budget.getUser().getId()
        );
    }
}
