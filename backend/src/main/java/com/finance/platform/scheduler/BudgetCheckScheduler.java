package com.finance.platform.scheduler;

import com.finance.platform.dto.analytics.BudgetProgressResponse;
import com.finance.platform.repository.UserRepository;
import com.finance.platform.service.DashboardService;
import com.finance.platform.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
@RequiredArgsConstructor
public class BudgetCheckScheduler {

    private final UserRepository userRepository;
    private final DashboardService dashboardService;
    private final NotificationService notificationService;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkExceededBudgets() {
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = LocalDateTime.of(today, LocalTime.MIDNIGHT);
        int month = today.getMonthValue();
        int year = today.getYear();

        userRepository.findAll().forEach(user -> {
            var progressList = dashboardService.getBudgetProgress(user.getId(), month, year);
            progressList.stream()
                    .filter(BudgetProgressResponse::isExceeded)
                    .forEach(progress -> {
                        String message = "Увага! Ви перевищили ліміт по категорії: " + progress.categoryName();
                        if (!notificationService.existsDuplicateSince(user.getId(), message, todayStart)) {
                            notificationService.createNotification(user.getId(), message);
                        }
                    });
        });
    }
}
