package com.finance.platform.service;

import com.finance.platform.dto.GoalRequest;
import com.finance.platform.dto.GoalResponse;
import com.finance.platform.entity.Goal;
import com.finance.platform.entity.User;
import com.finance.platform.exception.ResourceNotFoundException;
import com.finance.platform.repository.GoalRepository;
import com.finance.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    public List<GoalResponse> getAllGoals(Long userId) {
        return goalRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public GoalResponse getGoalById(Long id, Long userId) {
        Goal goal = goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", id));
        return toResponse(goal);
    }

    @Transactional
    public GoalResponse createGoal(GoalRequest request, Long userId) {
        User userRef = userRepository.getReferenceById(userId);

        Goal goal = Goal.builder()
                .name(request.name())
                .targetAmount(request.targetAmount())
                .currentAmount(request.currentAmount() != null ? request.currentAmount() : BigDecimal.ZERO)
                .deadline(request.deadline())
                .user(userRef)
                .build();

        return toResponse(goalRepository.save(goal));
    }

    @Transactional
    public GoalResponse updateGoal(Long id, GoalRequest request, Long userId) {
        Goal goal = goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", id));

        goal.setName(request.name());
        goal.setTargetAmount(request.targetAmount());
        goal.setCurrentAmount(request.currentAmount() != null ? request.currentAmount() : BigDecimal.ZERO);
        goal.setDeadline(request.deadline());

        return toResponse(goalRepository.save(goal));
    }

    @Transactional
    public void deleteGoal(Long id, Long userId) {
        Goal goal = goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", id));
        goalRepository.delete(goal);
    }

    private GoalResponse toResponse(Goal goal) {
        return new GoalResponse(
                goal.getId(),
                goal.getName(),
                goal.getTargetAmount(),
                goal.getCurrentAmount(),
                goal.getDeadline(),
                goal.getUser().getId()
        );
    }
}
