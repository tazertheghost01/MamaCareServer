package com.Mamacare.Backend.DailyGoalsPackage.Services;

import com.Mamacare.Backend.AuthenticationPackage.user.User;
import com.Mamacare.Backend.DailyGoalsPackage.Dto.CreateDailyGoalRequest;
import com.Mamacare.Backend.DailyGoalsPackage.Dto.DailyGoalResponse;
import com.Mamacare.Backend.DailyGoalsPackage.Dto.DailyGoalsHomeResponse;
import com.Mamacare.Backend.DailyGoalsPackage.Dto.UpdateDailyGoalRequest;
import com.Mamacare.Backend.DailyGoalsPackage.Entity.DailyGoal;
import com.Mamacare.Backend.DailyGoalsPackage.Enums.DailyGoalCategory;
import com.Mamacare.Backend.DailyGoalsPackage.Repo.DailyGoalRepo;
import com.Mamacare.Backend.DailyGoalsPackage.Repo.SystemDailyGoalRepo;
import com.Mamacare.Backend.DailyGoalsPackage.Entity.SystemDailyGoal;
import com.Mamacare.Backend.PregnancyCalculationPackage.Entity.PregnancyProfile;
import com.Mamacare.Backend.PregnancyCalculationPackage.Repo.PregnancyProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DailyGoalService {

    private final DailyGoalRepo dailyGoalRepository;
    private final PregnancyProfileRepository profileRepository;
    private final SystemDailyGoalRepo systemDailyGoalRepo;

    @Transactional
    public DailyGoalsHomeResponse getToday(Authentication authentication) {
        User user = getCurrentUser(authentication);
        LocalDate today = LocalDate.now();
        List<DailyGoal> goals = dailyGoalRepository
                .findByUserIdAndGoalDateAndActiveTrueOrderBySortOrderAscCreatedAtAsc(user.getId(), today);

        if (goals.isEmpty()) {
            goals = dailyGoalRepository.saveAll(defaultGoals(user, today));
        }

        int completedCount = (int) goals.stream().filter(DailyGoal::isCompleted).count();
        int totalCount = goals.size();
        int progressPercent = totalCount == 0 ? 0 : (completedCount * 100) / totalCount;

        return new DailyGoalsHomeResponse(
                "My Goals",
                "Track your daily goals",
                completedCount,
                totalCount,
                progressPercent,
                goals.stream().map(this::toResponse).toList()
        );
    }

    @Transactional
    public DailyGoalResponse createGoal(CreateDailyGoalRequest request, Authentication authentication) {
        User user = getCurrentUser(authentication);
        LocalDate goalDate = request.goalDate() == null ? LocalDate.now() : request.goalDate();

        DailyGoal goal = DailyGoal.builder()
                .user(user)
                .title(request.title().trim())
                .description(normalizeText(request.description()))
                .category(request.category() == null ? DailyGoalCategory.CUSTOM : request.category())
                .goalDate(goalDate)
                .build();

        return toResponse(dailyGoalRepository.save(goal));
    }

    @Transactional
    public DailyGoalResponse updateGoal(Long goalId, UpdateDailyGoalRequest request, Authentication authentication) {
        User user = getCurrentUser(authentication);
        DailyGoal goal = findGoal(goalId, user.getId());

        if (request.title() != null && !request.title().isBlank()) {
            goal.setTitle(request.title().trim());
        }
        if (request.description() != null) {
            goal.setDescription(normalizeText(request.description()));
        }
        if (request.category() != null) {
            goal.setCategory(request.category());
        }

        return toResponse(dailyGoalRepository.save(goal));
    }

    @Transactional
    public DailyGoalResponse markCompleted(Long goalId, Authentication authentication) {
        User user = getCurrentUser(authentication);
        DailyGoal goal = findGoal(goalId, user.getId());

        goal.setCompleted(true);
        goal.setCompletedAt(Instant.now());

        return toResponse(dailyGoalRepository.save(goal));
    }

    @Transactional
    public void deleteGoal(Long goalId, Authentication authentication) {
        User user = getCurrentUser(authentication);
        DailyGoal goal = findGoal(goalId, user.getId());
        goal.setActive(false);
        dailyGoalRepository.save(goal);
    }

    private List<DailyGoal> defaultGoals(User user, LocalDate today) {
        List<DailyGoal> initialGoals = new java.util.ArrayList<>();
        
        // Calculate pregnancy day to fetch system daily goal
        int pregnancyDay = 1;
        var profileOpt = profileRepository.findByUser(user);
        if (profileOpt.isPresent()) {
            PregnancyProfile profile = profileOpt.get();
            long daysSinceLmp = java.time.temporal.ChronoUnit.DAYS.between(profile.getLastMenstrualPeriod(), today);
            pregnancyDay = (int) daysSinceLmp + 1; // day 1 based
        }
        
        // Fetch everyday goals (pregnancyDay <= 0) AND the specific pregnancy day goal
        List<SystemDailyGoal> systemGoals = systemDailyGoalRepo.findByPregnancyDayLessThanEqualOrPregnancyDay(0, pregnancyDay);

        int sortOrder = 10;
        for (SystemDailyGoal sysGoal : systemGoals) {
            initialGoals.add(DailyGoal.builder()
                    .user(user)
                    .title(sysGoal.getTitle())
                    .category(sysGoal.getCategory())
                    .goalDate(today)
                    .sortOrder(sortOrder)
                    .build());
            sortOrder += 10;
        }

        return initialGoals;
    }

    private DailyGoal findGoal(Long goalId, Integer userId) {
        return dailyGoalRepository.findByIdAndUserId(goalId, userId)
                .filter(DailyGoal::isActive)
                .orElseThrow(() -> new IllegalArgumentException("Daily goal not found."));
    }

    private DailyGoalResponse toResponse(DailyGoal goal) {
        return new DailyGoalResponse(
                goal.getId(),
                goal.getTitle(),
                goal.getDescription(),
                goal.getCategory(),
                goal.getGoalDate(),
                goal.isCompleted(),
                goal.getCompletedAt()
        );
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new IllegalArgumentException("Authenticated user is required.");
        }
        return user;
    }

    private String normalizeText(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
