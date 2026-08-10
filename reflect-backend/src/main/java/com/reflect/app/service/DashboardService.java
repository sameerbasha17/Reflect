package com.reflect.app.service;

import com.reflect.app.dto.response.DashboardSummaryResponse;
import com.reflect.app.entity.SelfAssessment;
import com.reflect.app.entity.User;
import com.reflect.app.enums.GoalStatus;
import com.reflect.app.enums.HabitStatus;
import com.reflect.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.reflect.app.dto.response.*;
import com.reflect.app.entity.DailyActivityLog;
import com.reflect.app.entity.Goal;
import com.reflect.app.entity.Habit;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final GoalRepository goalRepository;
    private final MilestoneRepository milestoneRepository;
    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;
    private final ActivityLogRepository activityLogRepository;
    private final SelfAssessmentRepository selfAssessmentRepository;

    public DashboardSummaryResponse getSummary(String email) {
        User user = getUserByEmail(email);

        Long activeGoals = goalRepository.countByUserAndStatus(user, GoalStatus.IN_PROGRESS);
        Long completedGoals = goalRepository.countByUserAndStatus(user, GoalStatus.COMPLETED);
        Long completedMilestones = milestoneRepository.countCompletedMilestonesByUser(user);

        Double habitCompletionRate = calculateHabitCompletionRate(user);
        Double averageProductivityScore = activityLogRepository.findAverageProductivityByUser(user);

        Integer latestSelfAssessmentScore = selfAssessmentRepository.findFirstByUserOrderByWeekStartDateDesc(user)
                .map(SelfAssessment::getTotalScore)
                .orElse(0);

        return DashboardSummaryResponse.builder()
                .activeGoals(activeGoals)
                .completedGoals(completedGoals)
                .completedMilestones(completedMilestones)
                .habitCompletionRate(habitCompletionRate)
                .averageProductivityScore(averageProductivityScore != null ? averageProductivityScore : 0.0)
                .latestSelfAssessmentScore(latestSelfAssessmentScore)
                .build();
    }

    private Double calculateHabitCompletionRate(User user) {
        long totalLogs = habitLogRepository.countByUser(user);

        if (totalLogs == 0) {
            return 0.0;
        }

        long completedLogs = habitLogRepository.countByUserAndCompleted(user, true);
        return (completedLogs * 100.0) / totalLogs;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<GoalProgressResponse> getGoalProgress(String email) {
        User user = getUserByEmail(email);

        return goalRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(goal -> GoalProgressResponse.builder()
                        .goalId(goal.getId())
                        .title(goal.getTitle())
                        .progressPercentage(goal.getProgressPercentage())
                        .build())
                .toList();
    }

    public List<HabitCompletionResponse> getHabitCompletion(String email) {
        User user = getUserByEmail(email);

        return habitRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(habit -> HabitCompletionResponse.builder()
                        .habitId(habit.getId())
                        .title(habit.getTitle())
                        .completionPercentage(calculateHabitCompletionPercentage(habit))
                        .currentStreak(calculateHabitCurrentStreak(habit))
                        .build())
                .toList();
    }

    public List<ProductivityTrendResponse> getProductivityTrend(String email) {
        User user = getUserByEmail(email);

        return activityLogRepository.findTop7ByUserOrderByLogDateDesc(user)
                .stream()
                .sorted(Comparator.comparing(DailyActivityLog::getLogDate))
                .map(log -> ProductivityTrendResponse.builder()
                        .logDate(log.getLogDate())
                        .productivityLevel(log.getProductivityLevel())
                        .energyLevel(log.getEnergyLevel())
                        .build())
                .toList();
    }

    public List<SelfAssessmentTrendResponse> getSelfAssessmentTrend(String email) {
        User user = getUserByEmail(email);

        return selfAssessmentRepository.findTop6ByUserOrderByWeekStartDateDesc(user)
                .stream()
                .sorted(Comparator.comparing(SelfAssessment::getWeekStartDate))
                .map(assessment -> SelfAssessmentTrendResponse.builder()
                        .weekStartDate(assessment.getWeekStartDate())
                        .weekEndDate(assessment.getWeekEndDate())
                        .totalScore(assessment.getTotalScore())
                        .build())
                .toList();
    }

    private Double calculateHabitCompletionPercentage(Habit habit) {
        List<com.reflect.app.entity.HabitLog> logs = habitLogRepository.findByHabitOrderByLogDateDesc(habit);

        if (logs.isEmpty()) {
            return 0.0;
        }

        long completedCount = logs.stream()
                .filter(log -> Boolean.TRUE.equals(log.getCompleted()))
                .count();

        return (completedCount * 100.0) / logs.size();
    }

    private Integer calculateHabitCurrentStreak(Habit habit) {
        List<com.reflect.app.entity.HabitLog> logs = habitLogRepository.findByHabitOrderByLogDateDesc(habit);

        int streak = 0;
        java.time.LocalDate expectedDate = java.time.LocalDate.now();

        for (com.reflect.app.entity.HabitLog log : logs) {
            if (log.getLogDate().equals(expectedDate) && Boolean.TRUE.equals(log.getCompleted())) {
                streak++;
                expectedDate = expectedDate.minusDays(1);
            } else if (log.getLogDate().equals(expectedDate) && Boolean.FALSE.equals(log.getCompleted())) {
                break;
            }
        }

        return streak;
    }
}