package com.finance.platform.controller;

import com.finance.platform.dto.BudgetRequest;
import com.finance.platform.dto.BudgetResponse;
import com.finance.platform.security.UserPrincipal;
import com.finance.platform.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getAllBudgets(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(budgetService.getAllBudgets(principal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetResponse> getBudgetById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(budgetService.getBudgetById(id, principal.getId()));
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(
            @Valid @RequestBody BudgetRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(budgetService.createBudget(request, principal.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(budgetService.updateBudget(id, request, principal.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        budgetService.deleteBudget(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
