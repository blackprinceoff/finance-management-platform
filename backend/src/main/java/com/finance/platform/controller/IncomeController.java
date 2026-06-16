package com.finance.platform.controller;

import com.finance.platform.dto.IncomeRequest;
import com.finance.platform.dto.IncomeResponse;
import com.finance.platform.entity.User;
import com.finance.platform.service.IncomeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incomes")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;

    @GetMapping
    public ResponseEntity<List<IncomeResponse>> getAllIncomes(
            @RequestParam(required = false) Long categoryId) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(incomeService.getAllIncomes(currentUser.getId(), categoryId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncomeResponse> getIncomeById(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(incomeService.getIncomeById(id, currentUser.getId()));
    }

    @PostMapping
    public ResponseEntity<IncomeResponse> createIncome(@Valid @RequestBody IncomeRequest request) {
        User currentUser = getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(incomeService.createIncome(request, currentUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncomeResponse> updateIncome(
            @PathVariable Long id,
            @Valid @RequestBody IncomeRequest request) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(incomeService.updateIncome(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncome(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        incomeService.deleteIncome(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
