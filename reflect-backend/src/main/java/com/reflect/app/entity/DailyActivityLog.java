package com.reflect.app.entity;

import com.reflect.app.enums.Mood;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "daily_activity_logs",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "log_date"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(columnDefinition = "TEXT")
    private String plannedTasks;

    @Column(columnDefinition = "TEXT")
    private String completedTasks;

    @Enumerated(EnumType.STRING)
    private Mood mood;

    private Integer energyLevel;

    private Integer productivityLevel;

    @Column(columnDefinition = "TEXT")
    private String distractions;

    @Column(columnDefinition = "TEXT")
    private String reflectionNotes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}