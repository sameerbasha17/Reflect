package com.reflect.app.dto.response;

import com.reflect.app.enums.GoalCategory;
import com.reflect.app.enums.GoalPriority;
import com.reflect.app.enums.GoalStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class GoalResponse {

    private Long id;
    private String title;
    private String description;
    private GoalCategory category;
    private GoalPriority priority;
    private GoalStatus status;
    private LocalDate startDate;
    private LocalDate targetDate;
    private Double progressPercentage;
}