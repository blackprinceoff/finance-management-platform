package com.finance.platform.controller;

import com.finance.platform.dto.ExpenseRequest;
import com.finance.platform.dto.ExpenseResponse;
import com.finance.platform.entity.User;
import com.finance.platform.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getAllExpenses(
            @RequestParam(required = false) Long categoryId) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(expenseService.getAllExpenses(currentUser.getId(), categoryId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> getExpenseById(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(expenseService.getExpenseById(id, currentUser.getId()));
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(@Valid @RequestBody ExpenseRequest request) {
        User currentUser = getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(expenseService.createExpense(request, currentUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(expenseService.updateExpense(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        expenseService.deleteExpense(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
