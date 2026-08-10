package com.reflect.app.service;

import com.reflect.app.dto.request.HabitLogRequest;
import com.reflect.app.dto.response.HabitLogResponse;
import com.reflect.app.entity.Habit;
import com.reflect.app.entity.HabitLog;
import com.reflect.app.entity.User;
import com.reflect.app.repository.HabitLogRepository;
import com.reflect.app.repository.HabitRepository;
import com.reflect.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HabitLogService {

    private final UserRepository userRepository;
    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;

    public List<HabitLogResponse> getLogsByHabit(String email, Long habitId) {
        Habit habit = getHabitForUser(email, habitId);

        return habitLogRepository.findByHabitOrderByLogDateDesc(habit)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public HabitLogResponse createLog(String email, Long habitId, HabitLogRequest request) {
        Habit habit = getHabitForUser(email, habitId);
        User user = habit.getUser();

        if (habitLogRepository.existsByHabitAndLogDate(habit, request.getLogDate())) {
            throw new RuntimeException("Habit log already exists for this date");
        }

        HabitLog habitLog = HabitLog.builder()
                .habit(habit)
                .user(user)
                .logDate(request.getLogDate())
                .completed(request.getCompleted())
                .build();

        HabitLog savedLog = habitLogRepository.save(habitLog);
        return mapToResponse(savedLog);
    }

    public HabitLogResponse markComplete(String email, Long habitId, LocalDate date) {
        return markHabit(email, habitId, date, true);
    }

    public HabitLogResponse markMissed(String email, Long habitId, LocalDate date) {
        return markHabit(email, habitId, date, false);
    }

    private HabitLogResponse markHabit(String email, Long habitId, LocalDate date, boolean completed) {
        Habit habit = getHabitForUser(email, habitId);
        User user = habit.getUser();

        HabitLog habitLog = habitLogRepository.findByHabitAndLogDate(habit, date)
                .orElseGet(() -> HabitLog.builder()
                        .habit(habit)
                        .user(user)
                        .logDate(date)
                        .build());

        habitLog.setCompleted(completed);

        HabitLog savedLog = habitLogRepository.save(habitLog);
        return mapToResponse(savedLog);
    }

    private Habit getHabitForUser(String email, Long habitId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return habitRepository.findByIdAndUser(habitId, user)
                .orElseThrow(() -> new RuntimeException("Habit not found"));
    }

    private HabitLogResponse mapToResponse(HabitLog habitLog) {
        return HabitLogResponse.builder()
                .id(habitLog.getId())
                .habitId(habitLog.getHabit().getId())
                .logDate(habitLog.getLogDate())
                .completed(habitLog.getCompleted())
                .build();
    }
}