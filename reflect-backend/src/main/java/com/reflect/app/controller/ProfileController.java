package com.reflect.app.controller;

import com.reflect.app.dto.request.ProfileRequest;
import com.reflect.app.dto.response.ProfileResponse;
import com.reflect.app.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(Authentication authentication) {
        String email = authentication.getName();
        ProfileResponse response = profileService.getProfile(email);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ProfileResponse> createProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileRequest request
    ) {
        String email = authentication.getName();
        ProfileResponse response = profileService.createProfile(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileRequest request
    ) {
        String email = authentication.getName();
        ProfileResponse response = profileService.updateProfile(email, request);
        return ResponseEntity.ok(response);
    }
}