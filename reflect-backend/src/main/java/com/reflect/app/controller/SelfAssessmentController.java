package com.reflect.app.controller;

import com.reflect.app.dto.request.SelfAssessmentRequest;
import com.reflect.app.dto.response.SelfAssessmentResponse;
import com.reflect.app.service.SelfAssessmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/self-assessments")
@RequiredArgsConstructor
public class SelfAssessmentController {

    private final SelfAssessmentService selfAssessmentService;

    @GetMapping
    public ResponseEntity<List<SelfAssessmentResponse>> getAllAssessments(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(selfAssessmentService.getAllAssessments(email));
    }

    @GetMapping("/{assessmentId}")
    public ResponseEntity<SelfAssessmentResponse> getAssessmentById(
            Authentication authentication,
            @PathVariable Long assessmentId
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(selfAssessmentService.getAssessmentById(email, assessmentId));
    }

    @PostMapping
    public ResponseEntity<SelfAssessmentResponse> createAssessment(
            Authentication authentication,
            @Valid @RequestBody SelfAssessmentRequest request
    ) {
        String email = authentication.getName();
        SelfAssessmentResponse response = selfAssessmentService.createAssessment(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{assessmentId}")
    public ResponseEntity<SelfAssessmentResponse> updateAssessment(
            Authentication authentication,
            @PathVariable Long assessmentId,
            @Valid @RequestBody SelfAssessmentRequest request
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(selfAssessmentService.updateAssessment(email, assessmentId, request));
    }

    @DeleteMapping("/{assessmentId}")
    public ResponseEntity<Void> deleteAssessment(
            Authentication authentication,
            @PathVariable Long assessmentId
    ) {
        String email = authentication.getName();
        selfAssessmentService.deleteAssessment(email, assessmentId);
        return ResponseEntity.noContent().build();
    }
}