package com.reflect.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class MilestoneRequest {

    @NotBlank(message = "Milestone title is required")
    private String title;

    private String description;

    private LocalDate dueDate;
}