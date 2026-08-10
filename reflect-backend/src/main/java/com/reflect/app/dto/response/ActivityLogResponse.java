package com.reflect.app.dto.response;

import com.reflect.app.enums.Mood;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class ActivityLogResponse {

    private Long id;
    private LocalDate logDate;
    private String plannedTasks;
    private String completedTasks;
    private Mood mood;
    private Integer energyLevel;
    private Integer productivityLevel;
    private String distractions;
    private String reflectionNotes;
}