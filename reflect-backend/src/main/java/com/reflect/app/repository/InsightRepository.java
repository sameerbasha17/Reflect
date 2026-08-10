package com.reflect.app.repository;

import com.reflect.app.entity.Insight;
import com.reflect.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InsightRepository extends JpaRepository<Insight, Long> {

    List<Insight> findByUserOrderByGeneratedAtDesc(User user);

    Optional<Insight> findByIdAndUser(Long id, User user);
}