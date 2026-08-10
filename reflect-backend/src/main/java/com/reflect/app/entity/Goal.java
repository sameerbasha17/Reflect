package com.reflect.app.entity;

import com.reflect.app.enums.GoalCategory;
import com.reflect.app.enums.GoalPriority;
import com.reflect.app.enums.GoalStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GoalCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GoalPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GoalStatus status;

    private LocalDate startDate;

    private LocalDate targetDate;

    private Double progressPercentage;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = GoalStatus.NOT_STARTED;
        }

        if (progressPercentage == null) {
            progressPercentage = 0.0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}