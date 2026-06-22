package com.Mamacare.Backend.DailyGoalsPackage.Services;

import com.Mamacare.Backend.AuthenticationPackage.user.User;
import com.Mamacare.Backend.DailyGoalsPackage.Dto.CreateDailyGoalRequest;
import com.Mamacare.Backend.DailyGoalsPackage.Dto.DailyGoalResponse;
import com.Mamacare.Backend.DailyGoalsPackage.Dto.DailyGoalsHomeResponse;
import com.Mamacare.Backend.DailyGoalsPackage.Dto.UpdateDailyGoalRequest;
import com.Mamacare.Backend.DailyGoalsPackage.Entity.DailyGoal;
import com.Mamacare.Backend.DailyGoalsPackage.Enums.DailyGoalCategory;
import com.Mamacare.Backend.DailyGoalsPackage.Repo.DailyGoalRepo;
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
        return List.of(
                DailyGoal.builder()
                        .user(user)
                        .title("Drink 8 glasses of water")
                        .description("Drink enough water daily.")
                        .category(DailyGoalCategory.HYDRATION)
                        .goalDate(today)
                        .sortOrder(10)
                        .build(),
                DailyGoal.builder()
                        .user(user)
                        .title("Eat healthy meals")
                        .description("Eat healthy for you and your baby.")
                        .category(DailyGoalCategory.NUTRITION)
                        .goalDate(today)
                        .sortOrder(20)
                        .build(),
                DailyGoal.builder()
                        .user(user)
                        .title("Get enough rest")
                        .description("Good rest supports a healthy pregnancy.")
                        .category(DailyGoalCategory.REST)
                        .goalDate(today)
                        .sortOrder(30)
                        .build(),
                DailyGoal.builder()
                        .user(user)
                        .title("Manage stress")
                        .description("Stay calm and think positive.")
                        .category(DailyGoalCategory.STRESS)
                        .goalDate(today)
                        .sortOrder(40)
                        .build()
        );
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
