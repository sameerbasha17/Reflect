package com.reflect.app.dto.response;

import com.reflect.app.enums.InsightSeverity;
import com.reflect.app.enums.InsightType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class InsightResponse {

    private Long id;
    private InsightType insightType;
    private String message;
    private InsightSeverity severity;
    private LocalDateTime generatedAt;
    private Boolean isRead;
}