package com.reflect.app.controller;

import com.reflect.app.dto.request.HabitRequest;
import com.reflect.app.dto.response.HabitResponse;
import com.reflect.app.service.HabitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/habits")
@RequiredArgsConstructor
public class HabitController {

    private final HabitService habitService;

    @GetMapping
    public ResponseEntity<List<HabitResponse>> getAllHabits(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(habitService.getAllHabits(email));
    }

    @GetMapping("/{habitId}")
    public ResponseEntity<HabitResponse> getHabitById(
            Authentication authentication,
            @PathVariable Long habitId
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(habitService.getHabitById(email, habitId));
    }

    @PostMapping
    public ResponseEntity<HabitResponse> createHabit(
            Authentication authentication,
            @Valid @RequestBody HabitRequest request
    ) {
        String email = authentication.getName();
        HabitResponse response = habitService.createHabit(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{habitId}")
    public ResponseEntity<HabitResponse> updateHabit(
            Authentication authentication,
            @PathVariable Long habitId,
            @Valid @RequestBody HabitRequest request
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(habitService.updateHabit(email, habitId, request));
    }

    @DeleteMapping("/{habitId}")
    public ResponseEntity<Void> deleteHabit(
            Authentication authentication,
            @PathVariable Long habitId
    ) {
        String email = authentication.getName();
        habitService.deleteHabit(email, habitId);
        return ResponseEntity.noContent().build();
    }
}