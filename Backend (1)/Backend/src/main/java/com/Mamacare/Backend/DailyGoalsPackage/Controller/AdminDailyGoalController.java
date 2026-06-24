package com.Mamacare.Backend.DailyGoalsPackage.Controller;

import com.Mamacare.Backend.DailyGoalsPackage.Entity.SystemDailyGoal;
import com.Mamacare.Backend.DailyGoalsPackage.Enums.DailyGoalCategory;
import com.Mamacare.Backend.DailyGoalsPackage.Repo.SystemDailyGoalRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/admin/daily-goals")
@RequiredArgsConstructor
public class AdminDailyGoalController {

    private final SystemDailyGoalRepo systemDailyGoalRepo;

    @GetMapping
    public ResponseEntity<List<SystemDailyGoal>> getAllSystemGoals() {
        return ResponseEntity.ok(systemDailyGoalRepo.findAll());
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<SystemDailyGoal>> bulkUploadGoals(@RequestBody String textLines) {
        if (textLines == null || textLines.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        String[] lines = textLines.split("\\r?\\n");
        List<SystemDailyGoal> createdGoals = new ArrayList<>();

        SystemDailyGoal lastGoal = systemDailyGoalRepo.findTopByOrderByPregnancyDayDesc();
        int nextDay = lastGoal != null ? lastGoal.getPregnancyDay() + 1 : 1;

        for (String line : lines) {
            String title = line.trim();
            if (title.isBlank()) {
                continue;
            }
            if (title.length() > 200) {
                title = title.substring(0, 200);
            }

            SystemDailyGoal goal = SystemDailyGoal.builder()
                    .pregnancyDay(nextDay)
                    .title(title)
                    .category(DailyGoalCategory.CUSTOM)
                    .build();

            createdGoals.add(systemDailyGoalRepo.save(goal));
            nextDay++;
        }

        return ResponseEntity.ok(createdGoals);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SystemDailyGoal> updateSystemGoal(
            @PathVariable Long id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) DailyGoalCategory category
    ) {
        Optional<SystemDailyGoal> optGoal = systemDailyGoalRepo.findById(id);
        if (optGoal.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        SystemDailyGoal goal = optGoal.get();
        if (title != null && !title.isBlank()) {
            goal.setTitle(title.trim());
        }
        if (category != null) {
            goal.setCategory(category);
        }
        return ResponseEntity.ok(systemDailyGoalRepo.save(goal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSystemGoal(@PathVariable Long id) {
        if (!systemDailyGoalRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        systemDailyGoalRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
