package com.reflect.app.repository;

import com.reflect.app.entity.Habit;
import com.reflect.app.entity.User;
import com.reflect.app.enums.HabitStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HabitRepository extends JpaRepository<Habit, Long> {

    List<Habit> findByUserOrderByCreatedAtDesc(User user);

    Optional<Habit> findByIdAndUser(Long id, User user);

    long countByUserAndStatus(User user, HabitStatus status);
}