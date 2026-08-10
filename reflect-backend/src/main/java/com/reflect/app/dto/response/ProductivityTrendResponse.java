package com.reflect.app.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class ProductivityTrendResponse {

    private LocalDate logDate;
    private Integer productivityLevel;
    private Integer energyLevel;
}