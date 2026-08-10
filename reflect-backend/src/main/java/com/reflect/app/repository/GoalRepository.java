package com.reflect.app.repository;

import com.reflect.app.entity.Goal;
import com.reflect.app.entity.User;
import com.reflect.app.enums.GoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findByUserOrderByCreatedAtDesc(User user);

    Optional<Goal> findByIdAndUser(Long id, User user);

    long countByUserAndStatus(User user, GoalStatus status);
}