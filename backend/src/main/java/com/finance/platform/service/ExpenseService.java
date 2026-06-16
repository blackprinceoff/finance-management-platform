package com.finance.platform.service;

import com.finance.platform.dto.ExpenseRequest;
import com.finance.platform.dto.ExpenseResponse;
import com.finance.platform.entity.Category;
import com.finance.platform.entity.Expense;
import com.finance.platform.entity.User;
import com.finance.platform.exception.ResourceNotFoundException;
import com.finance.platform.exception.UnauthorizedException;
import com.finance.platform.repository.CategoryRepository;
import com.finance.platform.repository.ExpenseRepository;
import com.finance.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<ExpenseResponse> getAllExpenses(Long userId, Long categoryId) {
        List<Expense> expenses;

        if (categoryId != null) {
            expenses = expenseRepository.findByUserIdAndCategoryId(userId, categoryId);
        } else {
            expenses = expenseRepository.findByUserId(userId);
        }

        return expenses.stream()
                .map(this::toResponse)
                .toList();
    }

    public ExpenseResponse getExpenseById(Long id, Long userId) {
        Expense expense = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));
        return toResponse(expense);
    }

    @Transactional
    public ExpenseResponse createExpense(ExpenseRequest request, Long userId) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.categoryId()));

        if (!category.isGlobal() && !category.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You cannot use this category");
        }

        User userRef = userRepository.getReferenceById(userId);

        Expense expense = Expense.builder()
                .amount(request.amount())
                .description(request.description())
                .date(request.date())
                .category(category)
                .user(userRef)
                .build();

        return toResponse(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseResponse updateExpense(Long id, ExpenseRequest request, Long userId) {
        Expense expense = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.categoryId()));

        if (!category.isGlobal() && !category.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You cannot use this category");
        }

        expense.setAmount(request.amount());
        expense.setDescription(request.description());
        expense.setDate(request.date());
        expense.setCategory(category);

        return toResponse(expenseRepository.save(expense));
    }

    @Transactional
    public void deleteExpense(Long id, Long userId) {
        Expense expense = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));
        expenseRepository.delete(expense);
    }

    private ExpenseResponse toResponse(Expense expense) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getAmount(),
                expense.getDescription(),
                expense.getDate(),
                expense.getCategory().getId(),
                expense.getCategory().getName(),
                expense.getUser().getId()
        );
    }
}
