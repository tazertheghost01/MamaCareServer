package com.Mamacare.Backend.DailyGoalsPackage.Services;

import com.Mamacare.Backend.DailyGoalsPackage.Entity.SystemDailyGoal;
import com.Mamacare.Backend.DailyGoalsPackage.Enums.DailyGoalCategory;
import com.Mamacare.Backend.DailyGoalsPackage.Repo.SystemDailyGoalRepo;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class SystemDailyGoalSeeder implements CommandLineRunner {

    private final SystemDailyGoalRepo systemDailyGoalRepo;
    private static final Logger logger = LoggerFactory.getLogger(SystemDailyGoalSeeder.class);

    @Override
    public void run(String... args) {
        if (systemDailyGoalRepo.count() == 0) {
            logger.info("Seeding initial System Daily Goals (Everyday defaults)...");
            seedData();
        } else {
            logger.info("System Daily Goals already seeded.");
        }
    }

    private void seedData() {
        // pregnancyDay = 0 indicates it's an "Everyday" goal that applies to all days
        
        systemDailyGoalRepo.save(SystemDailyGoal.builder()
                .pregnancyDay(0) // 0 used as a special marker for "every day"
                .title("Drink 8 glasses of water")
                .category(DailyGoalCategory.HYDRATION)
                .build());

        systemDailyGoalRepo.save(SystemDailyGoal.builder()
                .pregnancyDay(-1) // using negative numbers to ensure unique pregnancy_day constraint
                .title("Eat healthy meals")
                .category(DailyGoalCategory.NUTRITION)
                .build());

        systemDailyGoalRepo.save(SystemDailyGoal.builder()
                .pregnancyDay(-2)
                .title("Get enough rest")
                .category(DailyGoalCategory.REST)
                .build());

        systemDailyGoalRepo.save(SystemDailyGoal.builder()
                .pregnancyDay(-3)
                .title("Manage stress")
                .category(DailyGoalCategory.STRESS)
                .build());

        logger.info("Successfully seeded System Daily Goals.");
    }
}
