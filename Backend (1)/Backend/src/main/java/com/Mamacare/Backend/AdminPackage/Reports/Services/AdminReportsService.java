package com.Mamacare.Backend.AdminPackage.Reports.Services;

import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioLanguage;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Repo.AdminAudioAssetRepository;
import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminMetricCard;
import com.Mamacare.Backend.AdminPackage.Reports.Dto.AdminBreakdownItem;
import com.Mamacare.Backend.AdminPackage.Reports.Dto.AdminReportsResponse;
import com.Mamacare.Backend.AppointmentPackage.Repo.AppointmentRepo;
import com.Mamacare.Backend.AuthenticationPackage.user.UserRepository;
import com.Mamacare.Backend.CommunityPackage.Repo.CommunityDiscussionRepository;
import com.Mamacare.Backend.DailyGoalsPackage.Repo.DailyGoalRepo;
import com.Mamacare.Backend.FitnessAppFeature.Repo.WalkSessionRepo;
import com.Mamacare.Backend.MedicationRemiderPackage.Repo.MedicationRepo;
import com.Mamacare.Backend.PregnancyCalculationPackage.Repo.PregnancyProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminReportsService {

    private final UserRepository userRepository;
    private final PregnancyProfileRepository pregnancyProfileRepository;
    private final AppointmentRepo appointmentRepository;
    private final MedicationRepo medicationRepository;
    private final WalkSessionRepo walkSessionRepository;
    private final DailyGoalRepo dailyGoalRepository;
    private final CommunityDiscussionRepository discussionRepository;
    private final AdminAudioAssetRepository audioAssetRepository;

    @Transactional(readOnly = true)
    public AdminReportsResponse getReports() {
        List<AdminMetricCard> summary = List.of(
                new AdminMetricCard("total_users", "Total Users", userRepository.count(), "Registered accounts"),
                new AdminMetricCard("active_pregnancies", "Active Pregnancies", pregnancyProfileRepository.count(), "Pregnancy profiles"),
                new AdminMetricCard("appointments", "Appointments", appointmentRepository.count(), "All appointments"),
                new AdminMetricCard("community_posts", "Community Posts", discussionRepository.count(), "All discussions")
        );

        List<AdminBreakdownItem> featureEngagement = List.of(
                new AdminBreakdownItem("Appointments", appointmentRepository.count(), "Counted from appointments table"),
                new AdminBreakdownItem("Medication", medicationRepository.count(), "Counted from medications table"),
                new AdminBreakdownItem("Walk & Exercise", walkSessionRepository.count(), "Counted from walk sessions"),
                new AdminBreakdownItem("Daily Goals", dailyGoalRepository.count(), "Counted from daily goals"),
                new AdminBreakdownItem("Community", discussionRepository.count(), "Counted from community discussions")
        );

        List<AdminBreakdownItem> audioByLanguage = Arrays.stream(AdminAudioLanguage.values())
                .map(language -> new AdminBreakdownItem(
                        language.name(),
                        audioAssetRepository.countByLanguage(language),
                        "Audio uploaded for " + language.name().toLowerCase()
                ))
                .toList();

        List<String> dataGaps = List.of(
                "User location is not currently stored on the user profile, so location charts cannot be accurate yet.",
                "Device platform is not currently tracked, so Android/iOS/Web charts require client telemetry later.",
                "Weekly percentage changes require timestamp columns on every source table; some existing tables do not have createdAt yet."
        );

        return new AdminReportsResponse(summary, featureEngagement, audioByLanguage, dataGaps);
    }
}
