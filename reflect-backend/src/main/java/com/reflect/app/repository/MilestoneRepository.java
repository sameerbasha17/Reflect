package com.reflect.app.repository;

import com.reflect.app.entity.Goal;
import com.reflect.app.entity.Milestone;
import com.reflect.app.enums.MilestoneStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import com.reflect.app.entity.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {

    List<Milestone> findByGoalOrderByCreatedAtAsc(Goal goal);

    Optional<Milestone> findByIdAndGoal(Long id, Goal goal);

    long countByGoal(Goal goal);

    long countByGoalAndStatus(Goal goal, MilestoneStatus status);

    @Query("SELECT COUNT(m) FROM Milestone m WHERE m.goal.user = :user AND m.status = com.reflect.app.enums.MilestoneStatus.COMPLETED")
    long countCompletedMilestonesByUser(@Param("user") User user);
}