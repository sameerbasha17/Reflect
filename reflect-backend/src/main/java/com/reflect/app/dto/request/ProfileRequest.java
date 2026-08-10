package com.reflect.app.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileRequest {

    @Min(value = 1, message = "Age must be at least 1")
    @Max(value = 120, message = "Age must be realistic")
    private Integer age;

    private String gender;

    private String focusAreas;

    @Min(value = 0, message = "Baseline score cannot be negative")
    @Max(value = 100, message = "Baseline score cannot be more than 100")
    private Integer baselineScore;

    private String bio;
}