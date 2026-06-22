package com.Mamacare.Backend.PregnancyCalculationPackage.Repo;

import com.Mamacare.Backend.PregnancyCalculationPackage.Entity.PregnancyWeeklyAudioTranslation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PregnancyWeeklyAudioTranslationRepo extends JpaRepository<PregnancyWeeklyAudioTranslation, Long> {
    Optional<PregnancyWeeklyAudioTranslation> findByWeeklyAudioIdAndLanguage(Long weeklyAudioId, String language);
}
