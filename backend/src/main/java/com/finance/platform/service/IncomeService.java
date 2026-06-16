package com.finance.platform.service;

import com.finance.platform.dto.IncomeRequest;
import com.finance.platform.dto.IncomeResponse;
import com.finance.platform.entity.Category;
import com.finance.platform.entity.Income;
import com.finance.platform.entity.User;
import com.finance.platform.exception.ResourceNotFoundException;
import com.finance.platform.exception.UnauthorizedException;
import com.finance.platform.repository.CategoryRepository;
import com.finance.platform.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final CategoryRepository categoryRepository;

    public List<IncomeResponse> getAllIncomes(Long userId, Long categoryId) {
        List<Income> incomes;

        if (categoryId != null) {
            incomes = incomeRepository.findByUserIdAndCategoryId(userId, categoryId);
        } else {
            incomes = incomeRepository.findByUserId(userId);
        }

        return incomes.stream()
                .map(this::toResponse)
                .toList();
    }

    public IncomeResponse getIncomeById(Long id, Long userId) {
        Income income = incomeRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Income", "id", id));
        return toResponse(income);
    }

    @Transactional
    public IncomeResponse createIncome(IncomeRequest request, User currentUser) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.categoryId()));

        if (!category.isGlobal() && !category.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You cannot use this category");
        }

        Income income = Income.builder()
                .amount(request.amount())
                .description(request.description())
                .date(request.date())
                .category(category)
                .user(currentUser)
                .build();

        return toResponse(incomeRepository.save(income));
    }

    @Transactional
    public IncomeResponse updateIncome(Long id, IncomeRequest request, User currentUser) {
        Income income = incomeRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Income", "id", id));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.categoryId()));

        if (!category.isGlobal() && !category.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You cannot use this category");
        }

        income.setAmount(request.amount());
        income.setDescription(request.description());
        income.setDate(request.date());
        income.setCategory(category);

        return toResponse(incomeRepository.save(income));
    }

    @Transactional
    public void deleteIncome(Long id, Long userId) {
        Income income = incomeRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Income", "id", id));
        incomeRepository.delete(income);
    }

    private IncomeResponse toResponse(Income income) {
        return new IncomeResponse(
                income.getId(),
                income.getAmount(),
                income.getDescription(),
                income.getDate(),
                income.getCategory().getId(),
                income.getCategory().getName(),
                income.getUser().getId()
        );
    }
}
