package com.reflect.app.controller;

import com.reflect.app.dto.request.MilestoneRequest;
import com.reflect.app.dto.response.MilestoneResponse;
import com.reflect.app.service.MilestoneService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MilestoneController {

    private final MilestoneService milestoneService;

    @GetMapping("/api/goals/{goalId}/milestones")
    public ResponseEntity<List<MilestoneResponse>> getMilestonesByGoal(
            Authentication authentication,
            @PathVariable Long goalId
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(milestoneService.getMilestonesByGoal(email, goalId));
    }

    @PostMapping("/api/goals/{goalId}/milestones")
    public ResponseEntity<MilestoneResponse> createMilestone(
            Authentication authentication,
            @PathVariable Long goalId,
            @Valid @RequestBody MilestoneRequest request
    ) {
        String email = authentication.getName();
        MilestoneResponse response = milestoneService.createMilestone(email, goalId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/api/goals/{goalId}/milestones/{milestoneId}")
    public ResponseEntity<MilestoneResponse> updateMilestone(
            Authentication authentication,
            @PathVariable Long goalId,
            @PathVariable Long milestoneId,
            @Valid @RequestBody MilestoneRequest request
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(milestoneService.updateMilestone(email, goalId, milestoneId, request));
    }

    @DeleteMapping("/api/goals/{goalId}/milestones/{milestoneId}")
    public ResponseEntity<Void> deleteMilestone(
            Authentication authentication,
            @PathVariable Long goalId,
            @PathVariable Long milestoneId
    ) {
        String email = authentication.getName();
        milestoneService.deleteMilestone(email, goalId, milestoneId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/api/goals/{goalId}/milestones/{milestoneId}/complete")
    public ResponseEntity<MilestoneResponse> markCompleted(
            Authentication authentication,
            @PathVariable Long goalId,
            @PathVariable Long milestoneId
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(milestoneService.markCompleted(email, goalId, milestoneId));
    }

    @PatchMapping("/api/goals/{goalId}/milestones/{milestoneId}/pending")
    public ResponseEntity<MilestoneResponse> markPending(
            Authentication authentication,
            @PathVariable Long goalId,
            @PathVariable Long milestoneId
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(milestoneService.markPending(email, goalId, milestoneId));
    }
}