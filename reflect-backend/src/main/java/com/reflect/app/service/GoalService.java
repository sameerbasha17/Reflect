package com.reflect.app.service;

import com.reflect.app.dto.request.GoalRequest;
import com.reflect.app.dto.response.GoalResponse;
import com.reflect.app.entity.Goal;
import com.reflect.app.entity.User;
import com.reflect.app.enums.GoalStatus;
import com.reflect.app.repository.GoalRepository;
import com.reflect.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    public List<GoalResponse> getAllGoals(String email) {
        User user = getUserByEmail(email);

        return goalRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public GoalResponse getGoalById(String email, Long goalId) {
        User user = getUserByEmail(email);

        Goal goal = goalRepository.findByIdAndUser(goalId, user)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        return mapToResponse(goal);
    }

    public GoalResponse createGoal(String email, GoalRequest request) {
        User user = getUserByEmail(email);

        Goal goal = Goal.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(request.getStatus() != null ? request.getStatus() : GoalStatus.NOT_STARTED)
                .startDate(request.getStartDate())
                .targetDate(request.getTargetDate())
                .progressPercentage(0.0)
                .build();

        Goal savedGoal = goalRepository.save(goal);
        return mapToResponse(savedGoal);
    }

    public GoalResponse updateGoal(String email, Long goalId, GoalRequest request) {
        User user = getUserByEmail(email);

        Goal goal = goalRepository.findByIdAndUser(goalId, user)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        goal.setTitle(request.getTitle());
        goal.setDescription(request.getDescription());
        goal.setCategory(request.getCategory());
        goal.setPriority(request.getPriority());

        if (request.getStatus() != null) {
            goal.setStatus(request.getStatus());
        }

        goal.setStartDate(request.getStartDate());
        goal.setTargetDate(request.getTargetDate());

        Goal updatedGoal = goalRepository.save(goal);
        return mapToResponse(updatedGoal);
    }

    public void deleteGoal(String email, Long goalId) {
        User user = getUserByEmail(email);

        Goal goal = goalRepository.findByIdAndUser(goalId, user)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        goalRepository.delete(goal);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private GoalResponse mapToResponse(Goal goal) {
        return GoalResponse.builder()
                .id(goal.getId())
                .title(goal.getTitle())
                .description(goal.getDescription())
                .category(goal.getCategory())
                .priority(goal.getPriority())
                .status(goal.getStatus())
                .startDate(goal.getStartDate())
                .targetDate(goal.getTargetDate())
                .progressPercentage(goal.getProgressPercentage())
                .build();
    }
}