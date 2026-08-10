package com.reflect.app.controller;

import com.reflect.app.dto.response.InsightResponse;
import com.reflect.app.service.InsightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
public class InsightController {

    private final InsightService insightService;

    @GetMapping
    public ResponseEntity<List<InsightResponse>> getInsights(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(insightService.getInsights(email));
    }

    @PostMapping("/generate")
    public ResponseEntity<List<InsightResponse>> generateInsights(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(insightService.generateInsights(email));
    }

    @PatchMapping("/{insightId}/read")
    public ResponseEntity<InsightResponse> markAsRead(
            Authentication authentication,
            @PathVariable Long insightId
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(insightService.markAsRead(email, insightId));
    }

    @DeleteMapping("/{insightId}")
    public ResponseEntity<Void> deleteInsight(
            Authentication authentication,
            @PathVariable Long insightId
    ) {
        String email = authentication.getName();
        insightService.deleteInsight(email, insightId);
        return ResponseEntity.noContent().build();
    }
}