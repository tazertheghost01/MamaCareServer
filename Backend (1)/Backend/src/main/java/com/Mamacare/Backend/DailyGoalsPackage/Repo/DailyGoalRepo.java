package com.Mamacare.Backend.DailyGoalsPackage.Repo;

import com.Mamacare.Backend.DailyGoalsPackage.Entity.DailyGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyGoalRepo extends JpaRepository<DailyGoal, Long> {

    List<DailyGoal> findByUserIdAndGoalDateAndActiveTrueOrderBySortOrderAscCreatedAtAsc(
            Integer userId,
            LocalDate goalDate
    );

    Optional<DailyGoal> findByIdAndUserId(Long id, Integer userId);
}
