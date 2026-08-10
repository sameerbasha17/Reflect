package com.reflect.app.service;

import com.reflect.app.dto.request.MilestoneRequest;
import com.reflect.app.dto.response.MilestoneResponse;
import com.reflect.app.entity.Goal;
import com.reflect.app.entity.Milestone;
import com.reflect.app.entity.User;
import com.reflect.app.enums.MilestoneStatus;
import com.reflect.app.repository.GoalRepository;
import com.reflect.app.repository.MilestoneRepository;
import com.reflect.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MilestoneService {

    private final UserRepository userRepository;
    private final GoalRepository goalRepository;
    private final MilestoneRepository milestoneRepository;

    public List<MilestoneResponse> getMilestonesByGoal(String email, Long goalId) {
        Goal goal = getGoalForUser(email, goalId);

        return milestoneRepository.findByGoalOrderByCreatedAtAsc(goal)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public MilestoneResponse createMilestone(String email, Long goalId, MilestoneRequest request) {
        Goal goal = getGoalForUser(email, goalId);

        Milestone milestone = Milestone.builder()
                .goal(goal)
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .status(MilestoneStatus.PENDING)
                .build();

        Milestone savedMilestone = milestoneRepository.save(milestone);
        recalculateGoalProgress(goal);

        return mapToResponse(savedMilestone);
    }

    public MilestoneResponse updateMilestone(String email, Long goalId, Long milestoneId, MilestoneRequest request) {
        Goal goal = getGoalForUser(email, goalId);

        Milestone milestone = milestoneRepository.findByIdAndGoal(milestoneId, goal)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        milestone.setTitle(request.getTitle());
        milestone.setDescription(request.getDescription());
        milestone.setDueDate(request.getDueDate());

        Milestone updatedMilestone = milestoneRepository.save(milestone);
        return mapToResponse(updatedMilestone);
    }

    public void deleteMilestone(String email, Long goalId, Long milestoneId) {
        Goal goal = getGoalForUser(email, goalId);

        Milestone milestone = milestoneRepository.findByIdAndGoal(milestoneId, goal)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        milestoneRepository.delete(milestone);
        recalculateGoalProgress(goal);
    }

    public MilestoneResponse markCompleted(String email, Long goalId, Long milestoneId) {
        Goal goal = getGoalForUser(email, goalId);

        Milestone milestone = milestoneRepository.findByIdAndGoal(milestoneId, goal)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        milestone.setStatus(MilestoneStatus.COMPLETED);
        milestone.setCompletedAt(LocalDateTime.now());

        Milestone updatedMilestone = milestoneRepository.save(milestone);
        recalculateGoalProgress(goal);

        return mapToResponse(updatedMilestone);
    }

    public MilestoneResponse markPending(String email, Long goalId, Long milestoneId) {
        Goal goal = getGoalForUser(email, goalId);

        Milestone milestone = milestoneRepository.findByIdAndGoal(milestoneId, goal)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        milestone.setStatus(MilestoneStatus.PENDING);
        milestone.setCompletedAt(null);

        Milestone updatedMilestone = milestoneRepository.save(milestone);
        recalculateGoalProgress(goal);

        return mapToResponse(updatedMilestone);
    }

    private Goal getGoalForUser(String email, Long goalId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return goalRepository.findByIdAndUser(goalId, user)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
    }

    private void recalculateGoalProgress(Goal goal) {
        long totalMilestones = milestoneRepository.countByGoal(goal);

        if (totalMilestones == 0) {
            goal.setProgressPercentage(0.0);
        } else {
            long completedMilestones = milestoneRepository.countByGoalAndStatus(goal, MilestoneStatus.COMPLETED);
            double progress = (completedMilestones * 100.0) / totalMilestones;
            goal.setProgressPercentage(progress);
        }

        goalRepository.save(goal);
    }

    private MilestoneResponse mapToResponse(Milestone milestone) {
        return MilestoneResponse.builder()
                .id(milestone.getId())
                .title(milestone.getTitle())
                .description(milestone.getDescription())
                .dueDate(milestone.getDueDate())
                .status(milestone.getStatus())
                .completedAt(milestone.getCompletedAt())
                .build();
    }
}