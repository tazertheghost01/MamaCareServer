package com.Mamacare.Backend.PreferencesPackage.Repo;

import com.Mamacare.Backend.PreferencesPackage.Entity.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserPreferenceRepo extends JpaRepository<UserPreference, Long> {

    Optional<UserPreference> findByUserId(Integer userId);
}
