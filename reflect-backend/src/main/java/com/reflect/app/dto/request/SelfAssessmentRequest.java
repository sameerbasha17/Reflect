package com.reflect.app.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class SelfAssessmentRequest {

    private LocalDate assessmentDate;

    @NotNull(message = "Week start date is required")
    private LocalDate weekStartDate;

    @NotNull(message = "Week end date is required")
    private LocalDate weekEndDate;

    @Min(value = 1, message = "Consistency score must be at least 1")
    @Max(value = 10, message = "Consistency score cannot be more than 10")
    private Integer consistencyScore;

    @Min(value = 1, message = "Discipline score must be at least 1")
    @Max(value = 10, message = "Discipline score cannot be more than 10")
    private Integer disciplineScore;

    @Min(value = 1, message = "Productivity score must be at least 1")
    @Max(value = 10, message = "Productivity score cannot be more than 10")
    private Integer productivityScore;

    @Min(value = 1, message = "Motivation score must be at least 1")
    @Max(value = 10, message = "Motivation score cannot be more than 10")
    private Integer motivationScore;

    @Min(value = 1, message = "Goal clarity score must be at least 1")
    @Max(value = 10, message = "Goal clarity score cannot be more than 10")
    private Integer goalClarityScore;

    private String notes;
}