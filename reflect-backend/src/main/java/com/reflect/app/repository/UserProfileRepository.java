package com.reflect.app.repository;

import com.reflect.app.entity.User;
import com.reflect.app.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    Optional<UserProfile> findByUser(User user);

    boolean existsByUser(User user);
}