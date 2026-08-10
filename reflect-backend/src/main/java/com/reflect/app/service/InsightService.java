package com.reflect.app.service;

import com.reflect.app.dto.response.InsightResponse;
import com.reflect.app.entity.Goal;
import com.reflect.app.entity.Insight;
import com.reflect.app.entity.SelfAssessment;
import com.reflect.app.entity.User;
import com.reflect.app.enums.GoalStatus;
import com.reflect.app.enums.InsightSeverity;
import com.reflect.app.enums.InsightType;
import com.reflect.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InsightService {

    private final UserRepository userRepository;
    private final InsightRepository insightRepository;
    private final GoalRepository goalRepository;
    private final HabitLogRepository habitLogRepository;
    private final ActivityLogRepository activityLogRepository;
    private final SelfAssessmentRepository selfAssessmentRepository;

    public List<InsightResponse> getInsights(String email) {
        User user = getUserByEmail(email);

        return insightRepository.findByUserOrderByGeneratedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<InsightResponse> generateInsights(String email) {
        User user = getUserByEmail(email);

        generateHabitInsight(user);
        generateProductivityInsight(user);
        generateGoalInsight(user);
        generateAssessmentInsight(user);

        return getInsights(email);
    }

    public InsightResponse markAsRead(String email, Long insightId) {
        User user = getUserByEmail(email);

        Insight insight = insightRepository.findByIdAndUser(insightId, user)
                .orElseThrow(() -> new RuntimeException("Insight not found"));

        insight.setIsRead(true);

        Insight updatedInsight = insightRepository.save(insight);
        return mapToResponse(updatedInsight);
    }

    public void deleteInsight(String email, Long insightId) {
        User user = getUserByEmail(email);

        Insight insight = insightRepository.findByIdAndUser(insightId, user)
                .orElseThrow(() -> new RuntimeException("Insight not found"));

        insightRepository.delete(insight);
    }

    private void generateHabitInsight(User user) {
        long totalLogs = habitLogRepository.countByUser(user);

        if (totalLogs == 0) {
            saveInsight(
                    user,
                    InsightType.HABIT,
                    "Start tracking your habits to understand your consistency pattern.",
                    InsightSeverity.INFO
            );
            return;
        }

        long completedLogs = habitLogRepository.countByUserAndCompleted(user, true);
        double completionRate = (completedLogs * 100.0) / totalLogs;

        if (completionRate < 50) {
            saveInsight(
                    user,
                    InsightType.HABIT,
                    "Your habit completion rate is below 50%. Try focusing on fewer habits and completing them consistently.",
                    InsightSeverity.WARNING
            );
        } else if (completionRate >= 80) {
            saveInsight(
                    user,
                    InsightType.HABIT,
                    "Great work. Your habit completion rate is strong.",
                    InsightSeverity.POSITIVE
            );
        } else {
            saveInsight(
                    user,
                    InsightType.HABIT,
                    "Your habit consistency is moderate. A small improvement can make your routine stronger.",
                    InsightSeverity.INFO
            );
        }
    }

    private void generateProductivityInsight(User user) {
        Double averageProductivity = activityLogRepository.findAverageProductivityByUser(user);

        if (averageProductivity == null) {
            saveInsight(
                    user,
                    InsightType.PRODUCTIVITY,
                    "Log daily productivity to discover your work patterns.",
                    InsightSeverity.INFO
            );
            return;
        }

        if (averageProductivity < 5) {
            saveInsight(
                    user,
                    InsightType.PRODUCTIVITY,
                    "Your average productivity score is low. Try reducing distractions and planning smaller daily tasks.",
                    InsightSeverity.WARNING
            );
        } else if (averageProductivity >= 8) {
            saveInsight(
                    user,
                    InsightType.PRODUCTIVITY,
                    "Your average productivity score is high. Keep using the routines that are working for you.",
                    InsightSeverity.POSITIVE
            );
        } else {
            saveInsight(
                    user,
                    InsightType.PRODUCTIVITY,
                    "Your productivity is stable. Review your activity logs to identify what helps you perform better.",
                    InsightSeverity.INFO
            );
        }
    }

    private void generateGoalInsight(User user) {
        List<Goal> goals = goalRepository.findByUserOrderByCreatedAtDesc(user);

        if (goals.isEmpty()) {
            saveInsight(
                    user,
                    InsightType.GOAL,
                    "Create your first goal and break it into milestones to start tracking progress.",
                    InsightSeverity.INFO
            );
            return;
        }

        long lowProgressGoals = goals.stream()
                .filter(goal -> goal.getStatus() == GoalStatus.IN_PROGRESS)
                .filter(goal -> goal.getProgressPercentage() != null && goal.getProgressPercentage() < 30)
                .count();

        if (lowProgressGoals > 0) {
            saveInsight(
                    user,
                    InsightType.GOAL,
                    "Some active goals have low progress. Review their milestones and choose one small next action.",
                    InsightSeverity.WARNING
            );
        } else {
            saveInsight(
                    user,
                    InsightType.GOAL,
                    "Your goals are being tracked. Keep updating milestones to maintain clear progress.",
                    InsightSeverity.POSITIVE
            );
        }
    }

    private void generateAssessmentInsight(User user) {
        SelfAssessment latestAssessment = selfAssessmentRepository
                .findFirstByUserOrderByWeekStartDateDesc(user)
                .orElse(null);

        if (latestAssessment == null) {
            saveInsight(
                    user,
                    InsightType.ASSESSMENT,
                    "Complete a weekly self-assessment to measure consistency, discipline, productivity, motivation, and clarity.",
                    InsightSeverity.INFO
            );
            return;
        }

        Integer score = latestAssessment.getTotalScore();

        if (score < 25) {
            saveInsight(
                    user,
                    InsightType.ASSESSMENT,
                    "Your latest self-assessment score is low. Pick one area to improve this week instead of trying to fix everything at once.",
                    InsightSeverity.WARNING
            );
        } else if (score >= 40) {
            saveInsight(
                    user,
                    InsightType.ASSESSMENT,
                    "Your latest self-assessment score is strong. Keep reinforcing the habits that support this progress.",
                    InsightSeverity.POSITIVE
            );
        } else {
            saveInsight(
                    user,
                    InsightType.ASSESSMENT,
                    "Your latest self-assessment score is moderate. Review which score area needs the most attention.",
                    InsightSeverity.INFO
            );
        }
    }

    private void saveInsight(User user, InsightType type, String message, InsightSeverity severity) {
        Insight insight = Insight.builder()
                .user(user)
                .insightType(type)
                .message(message)
                .severity(severity)
                .isRead(false)
                .build();

        insightRepository.save(insight);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private InsightResponse mapToResponse(Insight insight) {
        return InsightResponse.builder()
                .id(insight.getId())
                .insightType(insight.getInsightType())
                .message(insight.getMessage())
                .severity(insight.getSeverity())
                .generatedAt(insight.getGeneratedAt())
                .isRead(insight.getIsRead())
                .build();
    }
}