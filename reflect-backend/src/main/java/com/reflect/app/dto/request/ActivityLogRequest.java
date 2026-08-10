package com.reflect.app.dto.request;

import com.reflect.app.enums.Mood;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ActivityLogRequest {

    @NotNull(message = "Log date is required")
    private LocalDate logDate;

    private String plannedTasks;

    private String completedTasks;

    private Mood mood;

    @Min(value = 1, message = "Energy level must be at least 1")
    @Max(value = 10, message = "Energy level cannot be more than 10")
    private Integer energyLevel;

    @Min(value = 1, message = "Productivity level must be at least 1")
    @Max(value = 10, message = "Productivity level cannot be more than 10")
    private Integer productivityLevel;

    private String distractions;

    private String reflectionNotes;
}