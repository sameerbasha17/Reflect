package com.reflect.app.service;

import com.reflect.app.dto.request.ProfileRequest;
import com.reflect.app.dto.response.ProfileResponse;
import com.reflect.app.entity.User;
import com.reflect.app.entity.UserProfile;
import com.reflect.app.repository.UserProfileRepository;
import com.reflect.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.reflect.app.exception.DuplicateResourceException;
import com.reflect.app.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    public ProfileResponse getProfile(String email) {
        User user = getUserByEmail(email);

        UserProfile profile = userProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        return mapToResponse(profile);
    }

    public ProfileResponse createProfile(String email, ProfileRequest request) {
        User user = getUserByEmail(email);

        if (userProfileRepository.existsByUser(user)) {
            throw new DuplicateResourceException("Profile already exists");
        }

        UserProfile profile = UserProfile.builder()
                .user(user)
                .age(request.getAge())
                .gender(request.getGender())
                .focusAreas(request.getFocusAreas())
                .baselineScore(request.getBaselineScore())
                .bio(request.getBio())
                .build();

        UserProfile savedProfile = userProfileRepository.save(profile);
        return mapToResponse(savedProfile);
    }

    public ProfileResponse updateProfile(String email, ProfileRequest request) {
        User user = getUserByEmail(email);

        UserProfile profile = userProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        profile.setAge(request.getAge());
        profile.setGender(request.getGender());
        profile.setFocusAreas(request.getFocusAreas());
        profile.setBaselineScore(request.getBaselineScore());
        profile.setBio(request.getBio());

        UserProfile updatedProfile = userProfileRepository.save(profile);
        return mapToResponse(updatedProfile);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private ProfileResponse mapToResponse(UserProfile profile) {
        return ProfileResponse.builder()
                .id(profile.getId())
                .age(profile.getAge())
                .gender(profile.getGender())
                .focusAreas(profile.getFocusAreas())
                .baselineScore(profile.getBaselineScore())
                .bio(profile.getBio())
                .build();
    }
}