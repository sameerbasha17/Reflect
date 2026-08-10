package com.reflect.app.controller;

import com.reflect.app.dto.request.ActivityLogRequest;
import com.reflect.app.dto.response.ActivityLogResponse;
import com.reflect.app.service.ActivityLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/activity-logs")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<List<ActivityLogResponse>> getAllLogs(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(activityLogService.getAllLogs(email));
    }

    @GetMapping("/{activityId}")
    public ResponseEntity<ActivityLogResponse> getLogById(
            Authentication authentication,
            @PathVariable Long activityId
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(activityLogService.getLogById(email, activityId));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<ActivityLogResponse> getLogByDate(
            Authentication authentication,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(activityLogService.getLogByDate(email, date));
    }

    @PostMapping
    public ResponseEntity<ActivityLogResponse> createLog(
            Authentication authentication,
            @Valid @RequestBody ActivityLogRequest request
    ) {
        String email = authentication.getName();
        ActivityLogResponse response = activityLogService.createLog(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{activityId}")
    public ResponseEntity<ActivityLogResponse> updateLog(
            Authentication authentication,
            @PathVariable Long activityId,
            @Valid @RequestBody ActivityLogRequest request
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(activityLogService.updateLog(email, activityId, request));
    }

    @DeleteMapping("/{activityId}")
    public ResponseEntity<Void> deleteLog(
            Authentication authentication,
            @PathVariable Long activityId
    ) {
        String email = authentication.getName();
        activityLogService.deleteLog(email, activityId);
        return ResponseEntity.noContent().build();
    }
}