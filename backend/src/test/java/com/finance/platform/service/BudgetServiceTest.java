package com.finance.platform.service;

import com.finance.platform.dto.BudgetRequest;
import com.finance.platform.dto.BudgetResponse;
import com.finance.platform.entity.Budget;
import com.finance.platform.entity.Category;
import com.finance.platform.entity.CategoryType;
import com.finance.platform.entity.User;
import com.finance.platform.entity.UserStatus;
import com.finance.platform.exception.BadRequestException;
import com.finance.platform.exception.ResourceNotFoundException;
import com.finance.platform.exception.UnauthorizedException;
import com.finance.platform.repository.BudgetRepository;
import com.finance.platform.repository.CategoryRepository;
import com.finance.platform.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BudgetService budgetService;

    private User user;
    private Category expenseCategory;
    private Category incomeCategory;
    private Category nonOwnedCategory;
    private BudgetRequest request;
    private Budget savedBudget;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("password")
                .status(UserStatus.ACTIVE)
                .build();

        expenseCategory = Category.builder()
                .id(1L)
                .name("Groceries")
                .type(CategoryType.EXPENSE)
                .isGlobal(true)
                .build();

        incomeCategory = Category.builder()
                .id(2L)
                .name("Salary")
                .type(CategoryType.INCOME)
                .isGlobal(true)
                .build();

        nonOwnedCategory = Category.builder()
                .id(3L)
                .name("Personal")
                .type(CategoryType.EXPENSE)
                .isGlobal(false)
                .user(User.builder().id(999L).build())
                .build();

        request = new BudgetRequest(BigDecimal.valueOf(500.00), 6, 2026, 1L);

        savedBudget = Budget.builder()
                .id(1L)
                .amount(BigDecimal.valueOf(500.00))
                .month(6)
                .year(2026)
                .category(expenseCategory)
                .user(user)
                .build();
    }

    @Test
    void createBudget_Success() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(expenseCategory));
        when(budgetRepository.existsByUserIdAndCategoryIdAndMonthAndYear(1L, 1L, 6, 2026)).thenReturn(false);
        when(userRepository.getReferenceById(1L)).thenReturn(user);
        when(budgetRepository.save(any(Budget.class))).thenReturn(savedBudget);

        BudgetResponse response = budgetService.createBudget(request, 1L);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals(BigDecimal.valueOf(500.00), response.amount());
        assertEquals(6, response.month());
        assertEquals(2026, response.year());
        assertEquals(1L, response.categoryId());
        assertEquals("Groceries", response.categoryName());
        assertEquals(1L, response.userId());

        verify(budgetRepository, times(1)).save(any(Budget.class));
    }

    @Test
    void createBudget_ThrowsException_WhenCategoryNotFound() {
        when(categoryRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> budgetService.createBudget(request, 1L));

        verify(budgetRepository, never()).save(any(Budget.class));
    }

    @Test
    void createBudget_ThrowsException_WhenUnauthorizedCategory() {
        BudgetRequest unauthorizedRequest = new BudgetRequest(BigDecimal.valueOf(100.00), 6, 2026, 3L);
        when(categoryRepository.findById(3L)).thenReturn(Optional.of(nonOwnedCategory));

        assertThrows(UnauthorizedException.class,
                () -> budgetService.createBudget(unauthorizedRequest, 1L));

        verify(budgetRepository, never()).save(any(Budget.class));
    }

    @Test
    void createBudget_ThrowsException_WhenCategoryNotExpense() {
        BudgetRequest incomeRequest = new BudgetRequest(BigDecimal.valueOf(100.00), 6, 2026, 2L);
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(incomeCategory));

        assertThrows(BadRequestException.class,
                () -> budgetService.createBudget(incomeRequest, 1L));

        verify(budgetRepository, never()).save(any(Budget.class));
    }

    @Test
    void createBudget_ThrowsException_WhenDuplicateExists() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(expenseCategory));
        when(budgetRepository.existsByUserIdAndCategoryIdAndMonthAndYear(1L, 1L, 6, 2026)).thenReturn(true);

        assertThrows(BadRequestException.class,
                () -> budgetService.createBudget(request, 1L));

        verify(budgetRepository, never()).save(any(Budget.class));
    }
}
