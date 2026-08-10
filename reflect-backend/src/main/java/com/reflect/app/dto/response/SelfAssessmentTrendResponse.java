package com.reflect.app.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class SelfAssessmentTrendResponse {

    private LocalDate weekStartDate;
    private LocalDate weekEndDate;
    private Integer totalScore;
}