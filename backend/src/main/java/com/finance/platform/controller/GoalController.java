package com.finance.platform.controller;

import com.finance.platform.dto.GoalRequest;
import com.finance.platform.dto.GoalResponse;
import com.finance.platform.security.UserPrincipal;
import com.finance.platform.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    public ResponseEntity<List<GoalResponse>> getAllGoals(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(goalService.getAllGoals(principal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalResponse> getGoalById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(goalService.getGoalById(id, principal.getId()));
    }

    @PostMapping
    public ResponseEntity<GoalResponse> createGoal(
            @Valid @RequestBody GoalRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(goalService.createGoal(request, principal.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalResponse> updateGoal(
            @PathVariable Long id,
            @Valid @RequestBody GoalRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(goalService.updateGoal(id, request, principal.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        goalService.deleteGoal(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
