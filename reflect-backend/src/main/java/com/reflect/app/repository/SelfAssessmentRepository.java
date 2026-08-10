package com.reflect.app.repository;

import com.reflect.app.entity.SelfAssessment;
import com.reflect.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SelfAssessmentRepository extends JpaRepository<SelfAssessment, Long> {

    List<SelfAssessment> findByUserOrderByWeekStartDateDesc(User user);

    Optional<SelfAssessment> findByIdAndUser(Long id, User user);

    boolean existsByUserAndWeekStartDateAndWeekEndDate(
            User user,
            LocalDate weekStartDate,
            LocalDate weekEndDate
    );

    Optional<SelfAssessment> findFirstByUserOrderByWeekStartDateDesc(User user);

    List<SelfAssessment> findTop6ByUserOrderByWeekStartDateDesc(User user);
}