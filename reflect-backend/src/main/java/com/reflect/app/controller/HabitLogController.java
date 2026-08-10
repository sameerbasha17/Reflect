package com.reflect.app.controller;

import com.reflect.app.dto.request.HabitLogRequest;
import com.reflect.app.dto.response.HabitLogResponse;
import com.reflect.app.service.HabitLogService;
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
@RequestMapping("/api/habits/{habitId}/logs")
@RequiredArgsConstructor
public class HabitLogController {

    private final HabitLogService habitLogService;

    @GetMapping
    public ResponseEntity<List<HabitLogResponse>> getLogsByHabit(
            Authentication authentication,
            @PathVariable Long habitId
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(habitLogService.getLogsByHabit(email, habitId));
    }

    @PostMapping
    public ResponseEntity<HabitLogResponse> createLog(
            Authentication authentication,
            @PathVariable Long habitId,
            @Valid @RequestBody HabitLogRequest request
    ) {
        String email = authentication.getName();
        HabitLogResponse response = habitLogService.createLog(email, habitId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{date}/complete")
    public ResponseEntity<HabitLogResponse> markComplete(
            Authentication authentication,
            @PathVariable Long habitId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(habitLogService.markComplete(email, habitId, date));
    }

    @PatchMapping("/{date}/missed")
    public ResponseEntity<HabitLogResponse> markMissed(
            Authentication authentication,
            @PathVariable Long habitId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(habitLogService.markMissed(email, habitId, date));
    }
}