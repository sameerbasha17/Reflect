package com.reflect.app.controller;

import com.reflect.app.dto.request.GoalRequest;
import com.reflect.app.dto.response.GoalResponse;
import com.reflect.app.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    public ResponseEntity<List<GoalResponse>> getAllGoals(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(goalService.getAllGoals(email));
    }

    @GetMapping("/{goalId}")
    public ResponseEntity<GoalResponse> getGoalById(
            Authentication authentication,
            @PathVariable Long goalId
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(goalService.getGoalById(email, goalId));
    }

    @PostMapping
    public ResponseEntity<GoalResponse> createGoal(
            Authentication authentication,
            @Valid @RequestBody GoalRequest request
    ) {
        String email = authentication.getName();
        GoalResponse response = goalService.createGoal(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{goalId}")
    public ResponseEntity<GoalResponse> updateGoal(
            Authentication authentication,
            @PathVariable Long goalId,
            @Valid @RequestBody GoalRequest request
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(goalService.updateGoal(email, goalId, request));
    }

    @DeleteMapping("/{goalId}")
    public ResponseEntity<Void> deleteGoal(
            Authentication authentication,
            @PathVariable Long goalId
    ) {
        String email = authentication.getName();
        goalService.deleteGoal(email, goalId);
        return ResponseEntity.noContent().build();
    }
}