package com.reflect.app.service;

import com.reflect.app.dto.request.ActivityLogRequest;
import com.reflect.app.dto.response.ActivityLogResponse;
import com.reflect.app.entity.DailyActivityLog;
import com.reflect.app.entity.User;
import com.reflect.app.repository.ActivityLogRepository;
import com.reflect.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;

    public List<ActivityLogResponse> getAllLogs(String email) {
        User user = getUserByEmail(email);

        return activityLogRepository.findByUserOrderByLogDateDesc(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ActivityLogResponse getLogById(String email, Long activityId) {
        User user = getUserByEmail(email);

        DailyActivityLog log = activityLogRepository.findByIdAndUser(activityId, user)
                .orElseThrow(() -> new RuntimeException("Activity log not found"));

        return mapToResponse(log);
    }

    public ActivityLogResponse getLogByDate(String email, LocalDate date) {
        User user = getUserByEmail(email);

        DailyActivityLog log = activityLogRepository.findByUserAndLogDate(user, date)
                .orElseThrow(() -> new RuntimeException("Activity log not found for date"));

        return mapToResponse(log);
    }

    public ActivityLogResponse createLog(String email, ActivityLogRequest request) {
        User user = getUserByEmail(email);

        if (activityLogRepository.existsByUserAndLogDate(user, request.getLogDate())) {
            throw new RuntimeException("Activity log already exists for this date");
        }

        DailyActivityLog log = DailyActivityLog.builder()
                .user(user)
                .logDate(request.getLogDate())
                .plannedTasks(request.getPlannedTasks())
                .completedTasks(request.getCompletedTasks())
                .mood(request.getMood())
                .energyLevel(request.getEnergyLevel())
                .productivityLevel(request.getProductivityLevel())
                .distractions(request.getDistractions())
                .reflectionNotes(request.getReflectionNotes())
                .build();

        DailyActivityLog savedLog = activityLogRepository.save(log);
        return mapToResponse(savedLog);
    }

    public ActivityLogResponse updateLog(String email, Long activityId, ActivityLogRequest request) {
        User user = getUserByEmail(email);

        DailyActivityLog log = activityLogRepository.findByIdAndUser(activityId, user)
                .orElseThrow(() -> new RuntimeException("Activity log not found"));

        if (!log.getLogDate().equals(request.getLogDate())
                && activityLogRepository.existsByUserAndLogDate(user, request.getLogDate())) {
            throw new RuntimeException("Activity log already exists for this date");
        }

        log.setLogDate(request.getLogDate());
        log.setPlannedTasks(request.getPlannedTasks());
        log.setCompletedTasks(request.getCompletedTasks());
        log.setMood(request.getMood());
        log.setEnergyLevel(request.getEnergyLevel());
        log.setProductivityLevel(request.getProductivityLevel());
        log.setDistractions(request.getDistractions());
        log.setReflectionNotes(request.getReflectionNotes());

        DailyActivityLog updatedLog = activityLogRepository.save(log);
        return mapToResponse(updatedLog);
    }

    public void deleteLog(String email, Long activityId) {
        User user = getUserByEmail(email);

        DailyActivityLog log = activityLogRepository.findByIdAndUser(activityId, user)
                .orElseThrow(() -> new RuntimeException("Activity log not found"));

        activityLogRepository.delete(log);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private ActivityLogResponse mapToResponse(DailyActivityLog log) {
        return ActivityLogResponse.builder()
                .id(log.getId())
                .logDate(log.getLogDate())
                .plannedTasks(log.getPlannedTasks())
                .completedTasks(log.getCompletedTasks())
                .mood(log.getMood())
                .energyLevel(log.getEnergyLevel())
                .productivityLevel(log.getProductivityLevel())
                .distractions(log.getDistractions())
                .reflectionNotes(log.getReflectionNotes())
                .build();
    }
}