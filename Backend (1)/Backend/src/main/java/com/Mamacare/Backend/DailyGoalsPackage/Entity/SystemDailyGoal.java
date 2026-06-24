package com.Mamacare.Backend.DailyGoalsPackage.Entity;

import com.Mamacare.Backend.DailyGoalsPackage.Enums.DailyGoalCategory;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "system_daily_goals",
        indexes = {
                @Index(name = "idx_system_daily_goals_day", columnList = "pregnancy_day", unique = true)
        }
)
public class SystemDailyGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pregnancy_day", nullable = false, unique = true)
    private int pregnancyDay;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private DailyGoalCategory category = DailyGoalCategory.CUSTOM;

    @Column(name = "target_value", nullable = false)
    @Builder.Default
    private int targetValue = 0;
}
