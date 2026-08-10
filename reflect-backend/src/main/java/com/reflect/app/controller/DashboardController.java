package com.reflect.app.controller;

import com.reflect.app.dto.response.DashboardSummaryResponse;
import com.reflect.app.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.reflect.app.dto.response.*;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(dashboardService.getSummary(email));
    }

    @GetMapping("/goal-progress")
    public ResponseEntity<List<GoalProgressResponse>> getGoalProgress(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(dashboardService.getGoalProgress(email));
    }

    @GetMapping("/habit-completion")
    public ResponseEntity<List<HabitCompletionResponse>> getHabitCompletion(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(dashboardService.getHabitCompletion(email));
    }

    @GetMapping("/productivity-trend")
    public ResponseEntity<List<ProductivityTrendResponse>> getProductivityTrend(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(dashboardService.getProductivityTrend(email));
    }

    @GetMapping("/self-assessment-trend")
    public ResponseEntity<List<SelfAssessmentTrendResponse>> getSelfAssessmentTrend(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(dashboardService.getSelfAssessmentTrend(email));
    }
}