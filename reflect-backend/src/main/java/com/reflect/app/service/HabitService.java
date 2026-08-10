package com.reflect.app.service;

import com.reflect.app.dto.request.HabitRequest;
import com.reflect.app.dto.response.HabitResponse;
import com.reflect.app.entity.Habit;
import com.reflect.app.entity.HabitLog;
import com.reflect.app.entity.User;
import com.reflect.app.enums.HabitStatus;
import com.reflect.app.repository.HabitLogRepository;
import com.reflect.app.repository.HabitRepository;
import com.reflect.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HabitService {

    private final UserRepository userRepository;
    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;

    public List<HabitResponse> getAllHabits(String email) {
        User user = getUserByEmail(email);

        return habitRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public HabitResponse getHabitById(String email, Long habitId) {
        User user = getUserByEmail(email);

        Habit habit = habitRepository.findByIdAndUser(habitId, user)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        return mapToResponse(habit);
    }

    public HabitResponse createHabit(String email, HabitRequest request) {
        User user = getUserByEmail(email);

        Habit habit = Habit.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .frequency(request.getFrequency())
                .status(request.getStatus() != null ? request.getStatus() : HabitStatus.ACTIVE)
                .build();

        Habit savedHabit = habitRepository.save(habit);
        return mapToResponse(savedHabit);
    }

    public HabitResponse updateHabit(String email, Long habitId, HabitRequest request) {
        User user = getUserByEmail(email);

        Habit habit = habitRepository.findByIdAndUser(habitId, user)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        habit.setTitle(request.getTitle());
        habit.setDescription(request.getDescription());
        habit.setCategory(request.getCategory());
        habit.setFrequency(request.getFrequency());

        if (request.getStatus() != null) {
            habit.setStatus(request.getStatus());
        }

        Habit updatedHabit = habitRepository.save(habit);
        return mapToResponse(updatedHabit);
    }

    public void deleteHabit(String email, Long habitId) {
        User user = getUserByEmail(email);

        Habit habit = habitRepository.findByIdAndUser(habitId, user)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        habitRepository.delete(habit);
    }

    private Double calculateCompletionPercentage(Habit habit) {
        List<HabitLog> logs = habitLogRepository.findByHabitOrderByLogDateDesc(habit);

        if (logs.isEmpty()) {
            return 0.0;
        }

        long completedCount = logs.stream()
                .filter(log -> Boolean.TRUE.equals(log.getCompleted()))
                .count();

        return (completedCount * 100.0) / logs.size();
    }

    private Integer calculateCurrentStreak(Habit habit) {
        List<HabitLog> logs = habitLogRepository.findByHabitOrderByLogDateDesc(habit);

        int streak = 0;
        LocalDate expectedDate = LocalDate.now();

        for (HabitLog log : logs) {
            if (log.getLogDate().equals(expectedDate) && Boolean.TRUE.equals(log.getCompleted())) {
                streak++;
                expectedDate = expectedDate.minusDays(1);
            } else if (log.getLogDate().equals(expectedDate) && Boolean.FALSE.equals(log.getCompleted())) {
                break;
            }
        }

        return streak;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private HabitResponse mapToResponse(Habit habit) {
        return HabitResponse.builder()
                .id(habit.getId())
                .title(habit.getTitle())
                .description(habit.getDescription())
                .category(habit.getCategory())
                .frequency(habit.getFrequency())
                .status(habit.getStatus())
                .completionPercentage(calculateCompletionPercentage(habit))
                .currentStreak(calculateCurrentStreak(habit))
                .build();
    }
}