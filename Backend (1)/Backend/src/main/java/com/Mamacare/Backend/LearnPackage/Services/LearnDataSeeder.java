package com.Mamacare.Backend.LearnPackage.Services;

import com.Mamacare.Backend.LearnPackage.Entity.LearnCard;
import com.Mamacare.Backend.LearnPackage.Entity.LearnCardTranslation;
import com.Mamacare.Backend.LearnPackage.Enums.LearnCategory;
import com.Mamacare.Backend.LearnPackage.Repo.LearnCardRepo;
import com.Mamacare.Backend.LearnPackage.Repo.LearnCardTranslationRepo;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class LearnDataSeeder implements CommandLineRunner {

    private final LearnCardRepo learnCardRepo;
    private final LearnCardTranslationRepo translationRepo;
    private static final Logger logger = LoggerFactory.getLogger(LearnDataSeeder.class);

    @Override
    public void run(String... args) {
        if (learnCardRepo.count() == 0) {
            logger.info("Seeding initial Learn data...");
            seedData();
        } else {
            logger.info("Learn data already seeded.");
        }
    }

    private void seedData() {
        // 1. Nutrition
        LearnCard nutritionCard = LearnCard.builder()
                .id("nutrition-tip-1")
                .category(LearnCategory.NUTRITION)
                .durationSeconds(120)
                .build();
        learnCardRepo.save(nutritionCard);

        LearnCardTranslation nutritionEn = LearnCardTranslation.builder()
                .learnCard(nutritionCard)
                .language("EN")
                .title("Nutrition for you and baby")
                .body("Eating a balanced diet is vital for your health and your baby's development. Include plenty of fruits, vegetables, and proteins.")
                .build();
        translationRepo.save(nutritionEn);

        // 2. Medication
        LearnCard medicationCard = LearnCard.builder()
                .id("medication-tip-1")
                .category(LearnCategory.MEDICATION)
                .durationSeconds(90)
                .build();
        learnCardRepo.save(medicationCard);

        LearnCardTranslation medicationEn = LearnCardTranslation.builder()
                .learnCard(medicationCard)
                .language("EN")
                .title("Water helps medicines move safely")
                .body("Always take your prescribed medications with plenty of water. It helps absorption and keeps you hydrated.")
                .build();
        translationRepo.save(medicationEn);

        // 3. Baby Growth
        LearnCard babyGrowthCard = LearnCard.builder()
                .id("baby-growth-tip-1")
                .category(LearnCategory.BABY_GROWTH)
                .durationSeconds(150)
                .build();
        learnCardRepo.save(babyGrowthCard);

        LearnCardTranslation babyGrowthEn = LearnCardTranslation.builder()
                .learnCard(babyGrowthCard)
                .language("EN")
                .title("Your baby can hear your voice")
                .body("By the second trimester, your baby's ears are developing. Talking and singing to your bump helps bond with your baby.")
                .build();
        translationRepo.save(babyGrowthEn);

        // 4. Wellness
        LearnCard wellnessCard = LearnCard.builder()
                .id("wellness-tip-1")
                .category(LearnCategory.WELLNESS)
                .durationSeconds(105)
                .build();
        learnCardRepo.save(wellnessCard);

        LearnCardTranslation wellnessEn = LearnCardTranslation.builder()
                .learnCard(wellnessCard)
                .language("EN")
                .title("Managing stress the healthy way")
                .body("Pregnancy can be stressful. Take time out of your day to meditate, breathe deeply, or take a short walk to relax.")
                .build();
        translationRepo.save(wellnessEn);

        logger.info("Successfully seeded Learn data.");
    }
}
