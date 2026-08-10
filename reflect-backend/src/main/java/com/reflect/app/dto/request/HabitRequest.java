package com.reflect.app.dto.request;

import com.reflect.app.enums.GoalCategory;
import com.reflect.app.enums.HabitFrequency;
import com.reflect.app.enums.HabitStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HabitRequest {

    @NotBlank(message = "Habit title is required")
    private String title;

    private String description;

    private GoalCategory category;

    @NotNull(message = "Habit frequency is required")
    private HabitFrequency frequency;

    private HabitStatus status;
}