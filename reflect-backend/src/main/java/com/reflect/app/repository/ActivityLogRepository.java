package com.reflect.app.repository;

import com.reflect.app.entity.DailyActivityLog;
import com.reflect.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ActivityLogRepository extends JpaRepository<DailyActivityLog, Long> {

    List<DailyActivityLog> findByUserOrderByLogDateDesc(User user);

    Optional<DailyActivityLog> findByIdAndUser(Long id, User user);

    Optional<DailyActivityLog> findByUserAndLogDate(User user, LocalDate logDate);

    boolean existsByUserAndLogDate(User user, LocalDate logDate);

    @Query("SELECT AVG(a.productivityLevel) FROM DailyActivityLog a WHERE a.user = :user AND a.productivityLevel IS NOT NULL")
    Double findAverageProductivityByUser(@Param("user") User user);

    List<DailyActivityLog> findTop7ByUserOrderByLogDateDesc(User user);
}