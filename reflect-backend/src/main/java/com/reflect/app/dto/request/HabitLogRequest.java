package com.reflect.app.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class HabitLogRequest {

    @NotNull(message = "Log date is required")
    private LocalDate logDate;

    @NotNull(message = "Completed value is required")
    private Boolean completed;
}