package com.reflect.app.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class GoalProgressResponse {

    private Long goalId;
    private String title;
    private Double progressPercentage;
}