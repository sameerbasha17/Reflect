package com.reflect.app.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class HabitCompletionResponse {

    private Long habitId;
    private String title;
    private Double completionPercentage;
    private Integer currentStreak;
}