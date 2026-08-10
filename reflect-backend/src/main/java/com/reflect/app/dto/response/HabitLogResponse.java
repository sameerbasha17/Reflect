package com.reflect.app.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class HabitLogResponse {

    private Long id;
    private Long habitId;
    private LocalDate logDate;
    private Boolean completed;
}