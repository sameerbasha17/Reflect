package com.reflect.app.dto.request;

import com.reflect.app.enums.GoalCategory;
import com.reflect.app.enums.GoalPriority;
import com.reflect.app.enums.GoalStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class GoalRequest {

    @NotBlank(message = "Goal title is required")
    private String title;

    private String description;

    @NotNull(message = "Goal category is required")
    private GoalCategory category;

    @NotNull(message = "Goal priority is required")
    private GoalPriority priority;

    private GoalStatus status;

    private LocalDate startDate;

    private LocalDate targetDate;
}