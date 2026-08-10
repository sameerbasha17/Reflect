package com.reflect.app.dto.response;

import com.reflect.app.enums.MilestoneStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class MilestoneResponse {

    private Long id;
    private String title;
    private String description;
    private LocalDate dueDate;
    private MilestoneStatus status;
    private LocalDateTime completedAt;
}