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
        seedIfMissing(0, "Drink 8 glasses of water", DailyGoalCategory.HYDRATION, 0);
        seedIfMissing(-1, "Eat healthy meals", DailyGoalCategory.NUTRITION, 0);
        seedIfMissing(-2, "Get enough rest", DailyGoalCategory.REST, 0);
        seedIfMissing(-3, "Manage stress", DailyGoalCategory.STRESS, 0);
        seedIfMissing(-4, "Walk for 15 minutes", DailyGoalCategory.WALKING, 15);
    }

    private void seedIfMissing(int pregnancyDay, String title, DailyGoalCategory category, int targetValue) {
        if (systemDailyGoalRepo.findByPregnancyDay(pregnancyDay).isEmpty()) {
            logger.info("Seeding system daily goal for day {}: {}", pregnancyDay, title);
            systemDailyGoalRepo.save(SystemDailyGoal.builder()
                    .pregnancyDay(pregnancyDay)
                    .title(title)
                    .category(category)
                    .targetValue(targetValue)
                    .build());
        }
    }
}
