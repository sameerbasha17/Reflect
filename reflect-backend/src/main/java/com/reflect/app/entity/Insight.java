package com.reflect.app.entity;

import com.reflect.app.enums.InsightSeverity;
import com.reflect.app.enums.InsightType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "insights")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Insight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InsightType insightType;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InsightSeverity severity;

    private LocalDateTime generatedAt;

    private Boolean isRead;

    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();

        if (isRead == null) {
            isRead = false;
        }
    }
}