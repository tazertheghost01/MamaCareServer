package com.Mamacare.Backend.PregnancyCalculationPackage.Repo;

import com.Mamacare.Backend.PregnancyCalculationPackage.Entity.PregnancyWeeklyAudio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PregnancyWeeklyAudioRepo extends JpaRepository<PregnancyWeeklyAudio, Long> {
    Optional<PregnancyWeeklyAudio> findByWeekNumber(int weekNumber);
}
