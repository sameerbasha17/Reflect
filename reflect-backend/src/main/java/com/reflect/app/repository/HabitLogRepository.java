package com.reflect.app.repository;

import com.reflect.app.entity.Habit;
import com.reflect.app.entity.HabitLog;
import com.reflect.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HabitLogRepository extends JpaRepository<HabitLog, Long> {

    List<HabitLog> findByHabitOrderByLogDateDesc(Habit habit);

    Optional<HabitLog> findByHabitAndLogDate(Habit habit, LocalDate logDate);

    boolean existsByHabitAndLogDate(Habit habit, LocalDate logDate);

    long countByUser(User user);

    long countByUserAndCompleted(User user, Boolean completed);
}