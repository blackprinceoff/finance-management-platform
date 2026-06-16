package com.finance.platform.controller;

import com.finance.platform.dto.IncomeRequest;
import com.finance.platform.dto.IncomeResponse;
import com.finance.platform.security.UserPrincipal;
import com.finance.platform.service.IncomeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incomes")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;

    @GetMapping
    public ResponseEntity<List<IncomeResponse>> getAllIncomes(
            @RequestParam(required = false) Long categoryId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(incomeService.getAllIncomes(principal.getId(), categoryId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncomeResponse> getIncomeById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(incomeService.getIncomeById(id, principal.getId()));
    }

    @PostMapping
    public ResponseEntity<IncomeResponse> createIncome(
            @Valid @RequestBody IncomeRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(incomeService.createIncome(request, principal.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncomeResponse> updateIncome(
            @PathVariable Long id,
            @Valid @RequestBody IncomeRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(incomeService.updateIncome(id, request, principal.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncome(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        incomeService.deleteIncome(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
