package com.finance.platform.service;

import com.finance.platform.dto.IncomeRequest;
import com.finance.platform.dto.IncomeResponse;
import com.finance.platform.dto.TransactionPageResponse;
import com.finance.platform.entity.Category;
import com.finance.platform.entity.Income;
import com.finance.platform.entity.User;
import com.finance.platform.entity.CategoryType;
import com.finance.platform.exception.BadRequestException;
import com.finance.platform.exception.ResourceNotFoundException;
import com.finance.platform.exception.UnauthorizedException;
import com.finance.platform.repository.CategoryRepository;
import com.finance.platform.repository.IncomeRepository;
import com.finance.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

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

    public TransactionPageResponse<IncomeResponse> getAllIncomes(Long userId, Long categoryId, Pageable pageable) {
        Page<Income> page;

        if (categoryId != null) {
            page = incomeRepository.findByUserIdAndCategoryId(userId, categoryId, pageable);
        } else {
            page = incomeRepository.findByUserId(userId, pageable);
        }

        BigDecimal totalSum = incomeRepository.sumAllByUserId(userId);
        List<IncomeResponse> content = page.map(this::toResponse).getContent();

        return new TransactionPageResponse<>(
                content, page.getTotalPages(), page.getTotalElements(),
                page.getNumber(), page.getSize(), page.isFirst(), page.isLast(), totalSum);
    }

    public IncomeResponse getIncomeById(Long id, Long userId) {
        Income income = incomeRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Income", "id", id));
        return toResponse(income);
    }

    @Transactional
    public IncomeResponse createIncome(IncomeRequest request, Long userId) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.categoryId()));

        if (!category.isGlobal() && !category.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You cannot use this category");
        }

        if (category.getType() != CategoryType.INCOME) {
            throw new BadRequestException("Category must be of type INCOME");
        }

        User userRef = userRepository.getReferenceById(userId);

        Income income = Income.builder()
                .amount(request.amount())
                .description(request.description())
                .date(request.date())
                .category(category)
                .user(userRef)
                .build();

        return toResponse(incomeRepository.save(income));
    }

    @Transactional
    public IncomeResponse updateIncome(Long id, IncomeRequest request, Long userId) {
        Income income = incomeRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Income", "id", id));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.categoryId()));

        if (!category.isGlobal() && !category.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You cannot use this category");
        }

        if (category.getType() != CategoryType.INCOME) {
            throw new BadRequestException("Category must be of type INCOME");
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
