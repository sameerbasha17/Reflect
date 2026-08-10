package com.reflect.app.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ProfileResponse {

    private Long id;
    private Integer age;
    private String gender;
    private String focusAreas;
    private Integer baselineScore;
    private String bio;
}