package com.Mamacare.Backend.AdminPackage.Users.Services;

import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminMetricCard;
import com.Mamacare.Backend.AdminPackage.Users.Dto.AdminUserResponse;
import com.Mamacare.Backend.AuthenticationPackage.user.User;
import com.Mamacare.Backend.AuthenticationPackage.user.UserRepository;
import com.Mamacare.Backend.PregnancyCalculationPackage.Entity.PregnancyProfile;
import com.Mamacare.Backend.PregnancyCalculationPackage.Repo.PregnancyProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final PregnancyProfileRepository pregnancyProfileRepository;

    @Transactional(readOnly = true)
    public List<AdminMetricCard> getStats() {
        long active = userRepository.countByEnabled(true);
        long inactive = userRepository.countByEnabled(false);
        return List.of(
                new AdminMetricCard("total_users", "Total Users", userRepository.count(), "Registered accounts"),
                new AdminMetricCard("active_users", "Active Users", active, "Enabled accounts"),
                new AdminMetricCard("inactive_users", "Inactive Users", inactive, "Disabled or unverified accounts")
        );
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> listUsers(String search, Boolean enabled) {
        String normalizedSearch = search == null ? "" : search.trim().toLowerCase(Locale.ENGLISH);
        return userRepository.findAll()
                .stream()
                .filter(user -> enabled == null || user.isEnabled() == enabled)
                .filter(user -> normalizedSearch.isBlank()
                        || contains(user.getFullname(), normalizedSearch)
                        || contains(user.getEmail(), normalizedSearch)
                        || contains(user.getPhoneNumber(), normalizedSearch))
                .map(this::toResponse)
                .toList();
    }

    private AdminUserResponse toResponse(User user) {
        PregnancyProfile profile = pregnancyProfileRepository.findByUser(user).orElse(null);
        Integer week = profile == null ? null : gestationalWeek(profile);
        return new AdminUserResponse(
                user.getId(),
                user.getFullname(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole() == null ? null : user.getRole().name(),
                user.isEnabled() ? "Active" : "Inactive",
                week,
                week == null ? null : trimester(week)
        );
    }

    private boolean contains(String value, String search) {
        return value != null && value.toLowerCase(Locale.ENGLISH).contains(search);
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
