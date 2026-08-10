package com.reflect.app.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class DashboardSummaryResponse {

    private Long activeGoals;
    private Long completedGoals;
    private Long completedMilestones;
    private Double habitCompletionRate;
    private Double averageProductivityScore;
    private Integer latestSelfAssessmentScore;
}