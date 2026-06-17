package com.finance.platform.scheduler;

import com.finance.platform.repository.BudgetRepository;
import com.finance.platform.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;

@Component
@RequiredArgsConstructor
public class BudgetCheckScheduler {

    private final BudgetRepository budgetRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 * * * *") // Every hour
    @Transactional
    public void checkExceededBudgets() {
        LocalDate today = LocalDate.now();
        LocalDateTime todayStart = LocalDateTime.of(today, LocalTime.MIDNIGHT);
        int month = today.getMonthValue();
        int year = today.getYear();
        
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<BudgetRepository.ExceededBudgetInfo> exceededBudgets = budgetRepository.findExceededBudgets(month, year, startDate, endDate);

        for (BudgetRepository.ExceededBudgetInfo info : exceededBudgets) {
            String message = "Warning! Budget exceeded for category: " + info.getCategoryName();
            if (!notificationService.existsDuplicateSince(info.getUserId(), message, todayStart)) {
                notificationService.createNotification(info.getUserId(), message);
            }
        }
    }
}
