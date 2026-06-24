package com.Mamacare.Backend.DailyGoalsPackage.Repo;

import com.Mamacare.Backend.DailyGoalsPackage.Entity.SystemDailyGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SystemDailyGoalRepo extends JpaRepository<SystemDailyGoal, Long> {
    Optional<SystemDailyGoal> findByPregnancyDay(int pregnancyDay);
    List<SystemDailyGoal> findByPregnancyDayIn(List<Integer> days);
    
    // Finds everyday goals (<= 0) and the specific day goal
    List<SystemDailyGoal> findByPregnancyDayLessThanEqualOrPregnancyDay(int maxEveryday, int specificDay);
    
    SystemDailyGoal findTopByOrderByPregnancyDayDesc();
}
