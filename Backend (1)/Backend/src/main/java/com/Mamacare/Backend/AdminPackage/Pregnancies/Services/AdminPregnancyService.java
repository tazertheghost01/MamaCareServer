package com.Mamacare.Backend.AdminPackage.Pregnancies.Services;

import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminMetricCard;
import com.Mamacare.Backend.AdminPackage.Pregnancies.Dto.AdminPregnancyResponse;
import com.Mamacare.Backend.PregnancyCalculationPackage.Entity.PregnancyProfile;
import com.Mamacare.Backend.PregnancyCalculationPackage.Repo.PregnancyProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminPregnancyService {

    private final PregnancyProfileRepository pregnancyProfileRepository;

    @Transactional(readOnly = true)
    public List<AdminMetricCard> getStats() {
        return List.of(
                new AdminMetricCard("active_pregnancies", "Active Pregnancies", pregnancyProfileRepository.count(), "Pregnancy profiles")
        );
    }

    @Transactional(readOnly = true)
    public List<AdminPregnancyResponse> listPregnancies() {
        return pregnancyProfileRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private AdminPregnancyResponse toResponse(PregnancyProfile profile) {
        int week = gestationalWeek(profile);
        return new AdminPregnancyResponse(
                profile.getId(),
                profile.getUser().getId(),
                profile.getUser().getFullname(),
                profile.getUser().getEmail(),
                week,
                trimester(week),
                profile.getDueDate(),
                profile.getLastMenstrualPeriod(),
                profile.getSource(),
                profile.getDueDate().isBefore(LocalDate.now()) ? "Completed" : "Active"
        );
    }

    private int gestationalWeek(PregnancyProfile profile) {
        long daysSinceLmp = ChronoUnit.DAYS.between(profile.getLastMenstrualPeriod(), LocalDate.now());
        int calculatedWeek = (int) (daysSinceLmp / 7) + 1;
        return Math.max(1, Math.min(calculatedWeek, 42));
    }

    private String trimester(int week) {
        if (week <= 13) {
            return "1st Trimester";
        }
        if (week <= 27) {
            return "2nd Trimester";
        }
        return "3rd Trimester";
    }
}
