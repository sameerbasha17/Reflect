package com.reflect.app.service;

import com.reflect.app.dto.request.SelfAssessmentRequest;
import com.reflect.app.dto.response.SelfAssessmentResponse;
import com.reflect.app.entity.SelfAssessment;
import com.reflect.app.entity.User;
import com.reflect.app.repository.SelfAssessmentRepository;
import com.reflect.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SelfAssessmentService {

    private final UserRepository userRepository;
    private final SelfAssessmentRepository selfAssessmentRepository;

    public List<SelfAssessmentResponse> getAllAssessments(String email) {
        User user = getUserByEmail(email);

        return selfAssessmentRepository.findByUserOrderByWeekStartDateDesc(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public SelfAssessmentResponse getAssessmentById(String email, Long assessmentId) {
        User user = getUserByEmail(email);

        SelfAssessment assessment = selfAssessmentRepository.findByIdAndUser(assessmentId, user)
                .orElseThrow(() -> new RuntimeException("Self assessment not found"));

        return mapToResponse(assessment);
    }

    public SelfAssessmentResponse createAssessment(String email, SelfAssessmentRequest request) {
        User user = getUserByEmail(email);

        if (selfAssessmentRepository.existsByUserAndWeekStartDateAndWeekEndDate(
                user,
                request.getWeekStartDate(),
                request.getWeekEndDate()
        )) {
            throw new RuntimeException("Self assessment already exists for this week");
        }

        SelfAssessment assessment = SelfAssessment.builder()
                .user(user)
                .assessmentDate(request.getAssessmentDate() != null ? request.getAssessmentDate() : LocalDate.now())
                .weekStartDate(request.getWeekStartDate())
                .weekEndDate(request.getWeekEndDate())
                .consistencyScore(request.getConsistencyScore())
                .disciplineScore(request.getDisciplineScore())
                .productivityScore(request.getProductivityScore())
                .motivationScore(request.getMotivationScore())
                .goalClarityScore(request.getGoalClarityScore())
                .totalScore(calculateTotalScore(request))
                .notes(request.getNotes())
                .build();

        SelfAssessment savedAssessment = selfAssessmentRepository.save(assessment);
        return mapToResponse(savedAssessment);
    }

    public SelfAssessmentResponse updateAssessment(String email, Long assessmentId, SelfAssessmentRequest request) {
        User user = getUserByEmail(email);

        SelfAssessment assessment = selfAssessmentRepository.findByIdAndUser(assessmentId, user)
                .orElseThrow(() -> new RuntimeException("Self assessment not found"));

        if ((!assessment.getWeekStartDate().equals(request.getWeekStartDate())
                || !assessment.getWeekEndDate().equals(request.getWeekEndDate()))
                && selfAssessmentRepository.existsByUserAndWeekStartDateAndWeekEndDate(
                user,
                request.getWeekStartDate(),
                request.getWeekEndDate()
        )) {
            throw new RuntimeException("Self assessment already exists for this week");
        }

        assessment.setAssessmentDate(request.getAssessmentDate() != null ? request.getAssessmentDate() : assessment.getAssessmentDate());
        assessment.setWeekStartDate(request.getWeekStartDate());
        assessment.setWeekEndDate(request.getWeekEndDate());
        assessment.setConsistencyScore(request.getConsistencyScore());
        assessment.setDisciplineScore(request.getDisciplineScore());
        assessment.setProductivityScore(request.getProductivityScore());
        assessment.setMotivationScore(request.getMotivationScore());
        assessment.setGoalClarityScore(request.getGoalClarityScore());
        assessment.setTotalScore(calculateTotalScore(request));
        assessment.setNotes(request.getNotes());

        SelfAssessment updatedAssessment = selfAssessmentRepository.save(assessment);
        return mapToResponse(updatedAssessment);
    }

    public void deleteAssessment(String email, Long assessmentId) {
        User user = getUserByEmail(email);

        SelfAssessment assessment = selfAssessmentRepository.findByIdAndUser(assessmentId, user)
                .orElseThrow(() -> new RuntimeException("Self assessment not found"));

        selfAssessmentRepository.delete(assessment);
    }

    private Integer calculateTotalScore(SelfAssessmentRequest request) {
        return safeScore(request.getConsistencyScore())
                + safeScore(request.getDisciplineScore())
                + safeScore(request.getProductivityScore())
                + safeScore(request.getMotivationScore())
                + safeScore(request.getGoalClarityScore());
    }

    private Integer safeScore(Integer score) {
        return score != null ? score : 0;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private SelfAssessmentResponse mapToResponse(SelfAssessment assessment) {
        return SelfAssessmentResponse.builder()
                .id(assessment.getId())
                .assessmentDate(assessment.getAssessmentDate())
                .weekStartDate(assessment.getWeekStartDate())
                .weekEndDate(assessment.getWeekEndDate())
                .consistencyScore(assessment.getConsistencyScore())
                .disciplineScore(assessment.getDisciplineScore())
                .productivityScore(assessment.getProductivityScore())
                .motivationScore(assessment.getMotivationScore())
                .goalClarityScore(assessment.getGoalClarityScore())
                .totalScore(assessment.getTotalScore())
                .notes(assessment.getNotes())
                .build();
    }
}