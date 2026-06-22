package com.finance.platform.service;

import com.finance.platform.dto.analytics.BudgetProgressResponse;
import com.finance.platform.dto.analytics.DashboardSummaryResponse;
import com.finance.platform.entity.Budget;
import com.finance.platform.repository.BudgetRepository;
import com.finance.platform.repository.ExpenseRepository;
import com.finance.platform.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

        private final IncomeRepository incomeRepository;
        private final ExpenseRepository expenseRepository;
        private final BudgetRepository budgetRepository;

        public DashboardSummaryResponse getSummary(Long userId, int month, int year) {
                BigDecimal totalIncome = incomeRepository.sumByUserIdAndMonthAndYear(userId, month, year);
                BigDecimal totalExpense = expenseRepository.sumByUserIdAndMonthAndYear(userId, month, year);
                BigDecimal currentBalance = totalIncome.subtract(totalExpense);

                return new DashboardSummaryResponse(totalIncome, totalExpense, currentBalance);
        }

        public List<BudgetProgressResponse> getBudgetProgress(Long userId, int month, int year) {
                List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);

                Map<Long, BigDecimal> spentByCategory = expenseRepository
                                .sumByCategoryForUserAndMonth(userId, month, year).stream()
                                .collect(Collectors.toMap(
                                                ExpenseRepository.CategorySpending::getCategoryId,
                                                ExpenseRepository.CategorySpending::getTotalSpent
                                ));

                return budgets.stream()
                                .map(budget -> {
                                        BigDecimal spent = spentByCategory.getOrDefault(
                                                        budget.getCategory().getId(), BigDecimal.ZERO);
                                        BigDecimal remaining = budget.getAmount().subtract(spent);
                                        boolean isExceeded = spent.compareTo(budget.getAmount()) > 0;
                                        return new BudgetProgressResponse(
                                                        budget.getCategory().getName(),
                                                        budget.getAmount(),
                                                        spent,
                                                        remaining,
                                                        isExceeded);
                                })
                                .toList();
        }
}

