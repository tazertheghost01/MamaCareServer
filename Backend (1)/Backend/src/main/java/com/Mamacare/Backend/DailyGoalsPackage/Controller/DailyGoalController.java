package com.Mamacare.Backend.DailyGoalsPackage.Controller;

import com.Mamacare.Backend.DailyGoalsPackage.Dto.CreateDailyGoalRequest;
import com.Mamacare.Backend.DailyGoalsPackage.Dto.DailyGoalResponse;
import com.Mamacare.Backend.DailyGoalsPackage.Dto.DailyGoalsHomeResponse;
import com.Mamacare.Backend.DailyGoalsPackage.Dto.UpdateDailyGoalRequest;
import com.Mamacare.Backend.DailyGoalsPackage.Services.DailyGoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/daily-goals")
@RequiredArgsConstructor
public class DailyGoalController {

    private final DailyGoalService dailyGoalService;

    @GetMapping("/today")
    public ResponseEntity<DailyGoalsHomeResponse> getToday(Authentication authentication) {
        return ResponseEntity.ok(dailyGoalService.getToday(authentication));
    }

    @PostMapping
    public ResponseEntity<DailyGoalResponse> createGoal(
            @Valid @RequestBody CreateDailyGoalRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(dailyGoalService.createGoal(request, authentication));
    }

    @PatchMapping("/{goalId}")
    public ResponseEntity<DailyGoalResponse> updateGoal(
            @PathVariable Long goalId,
            @Valid @RequestBody UpdateDailyGoalRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(dailyGoalService.updateGoal(goalId, request, authentication));
    }

    @PatchMapping("/{goalId}/complete")
    public ResponseEntity<DailyGoalResponse> markCompleted(
            @PathVariable Long goalId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(dailyGoalService.markCompleted(goalId, authentication));
    }

    @DeleteMapping("/{goalId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGoal(@PathVariable Long goalId, Authentication authentication) {
        dailyGoalService.deleteGoal(goalId, authentication);
    }
}
