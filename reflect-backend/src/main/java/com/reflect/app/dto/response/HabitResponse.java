package com.reflect.app.dto.response;

import com.reflect.app.enums.GoalCategory;
import com.reflect.app.enums.HabitFrequency;
import com.reflect.app.enums.HabitStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class HabitResponse {

    private Long id;
    private String title;
    private String description;
    private GoalCategory category;
    private HabitFrequency frequency;
    private HabitStatus status;
    private Double completionPercentage;
    private Integer currentStreak;
}