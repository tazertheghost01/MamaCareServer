package com.Mamacare.Backend.BabyGrowthPackage.Services;

import com.Mamacare.Backend.BabyGrowthPackage.Dto.BabyGrowthResponse;
import com.Mamacare.Backend.PregnancyCalculationPackage.Dto.PregnancySummaryResponse;
import com.Mamacare.Backend.PregnancyCalculationPackage.Enum.PregnancyDateSource;
import com.Mamacare.Backend.PregnancyCalculationPackage.Services.PregnancyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BabyGrowthServiceTest {

    private BabyGrowthService babyGrowthService;

    @Mock
    private PregnancyService pregnancyService;

    @BeforeEach
    void setUp() {
        babyGrowthService = new BabyGrowthService(pregnancyService, new BabyGrowthContentCatalog());
    }

    @Test
    void getTodayBuildsScreenFromPregnancyWeek() {
        when(pregnancyService.getMyPregnancy("mama@example.com"))
                .thenReturn(new PregnancySummaryResponse(
                        LocalDate.of(2026, 10, 1),
                        LocalDate.of(2025, 12, 25),
                        PregnancyDateSource.LMP,
                        24,
                        "2nd trimester",
                        108
                ));

        BabyGrowthResponse response = babyGrowthService.getToday("mama@example.com");

        assertThat(response.screenTitle()).isEqualTo("Baby Growth");
        assertThat(response.heroMessage()).isEqualTo("Your baby is growing beautifully!");
        assertThat(response.audioUpdate().language()).isEqualTo("YORUBA");
        assertThat(response.audioUpdate().label()).isEqualTo("Listen in Yoruba");
        assertThat(response.audioUpdate().durationSeconds()).isEqualTo(75);
        assertThat(response.audioUpdate().audioUrl()).isEqualTo("/audio/baby-growth/yoruba/week-24.mp3");
        assertThat(response.pregnancyStatus().message()).isEqualTo("You are 24 weeks pregnant");
        assertThat(response.pregnancyStatus().trimester()).isEqualTo("2nd Trimester");
        assertThat(response.pregnancyStatus().weekLabel()).isEqualTo("Week 24");
        assertThat(response.pregnancyStatus().daysToGo()).isEqualTo(108);
        assertThat(response.growthThisWeek().lengthLabel()).isEqualTo("30.0 cm");
        assertThat(response.growthThisWeek().weightLabel()).isEqualTo("600 g");
        assertThat(response.growthThisWeek().heartbeatLabel()).isEqualTo("Strong");
        assertThat(response.happenings())
                .extracting(BabyGrowthResponse.WeeklyHappening::text)
                .containsExactly(
                        "Baby's lungs are developing.",
                        "Baby can hear your voice.",
                        "Baby's movement may be stronger."
                );
        assertThat(response.disclaimer()).contains("educational estimates");
        verify(pregnancyService).getMyPregnancy("mama@example.com");
    }

    @Test
    void getTodayFormatsUnknownTrimesterSafely() {
        when(pregnancyService.getMyPregnancy("mama@example.com"))
                .thenReturn(new PregnancySummaryResponse(
                        LocalDate.of(2026, 12, 1),
                        LocalDate.of(2026, 2, 24),
                        PregnancyDateSource.DUE_DATE,
                        6,
                        "early pregnancy",
                        169
                ));

        BabyGrowthResponse response = babyGrowthService.getToday("mama@example.com");

        assertThat(response.pregnancyStatus().trimester()).isEqualTo("early pregnancy");
        assertThat(response.growthThisWeek().lengthLabel()).isEqualTo("0.4 cm");
        assertThat(response.happenings()).hasSize(3);
    }
}
