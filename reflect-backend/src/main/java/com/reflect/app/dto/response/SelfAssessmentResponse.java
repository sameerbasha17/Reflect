package com.reflect.app.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class SelfAssessmentResponse {

    private Long id;
    private LocalDate assessmentDate;
    private LocalDate weekStartDate;
    private LocalDate weekEndDate;
    private Integer consistencyScore;
    private Integer disciplineScore;
    private Integer productivityScore;
    private Integer motivationScore;
    private Integer goalClarityScore;
    private Integer totalScore;
    private String notes;
}