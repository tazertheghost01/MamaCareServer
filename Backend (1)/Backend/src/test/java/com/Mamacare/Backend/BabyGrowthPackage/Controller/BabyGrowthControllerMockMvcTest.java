package com.Mamacare.Backend.BabyGrowthPackage.Controller;

import com.Mamacare.Backend.BabyGrowthPackage.Dto.BabyGrowthResponse;
import com.Mamacare.Backend.BabyGrowthPackage.Services.BabyGrowthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class BabyGrowthControllerMockMvcTest {

    private MockMvc mockMvc;

    @Mock
    private BabyGrowthService babyGrowthService;

    @Mock
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        BabyGrowthController controller = new BabyGrowthController(babyGrowthService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void getTodayReturnsBabyGrowthScreenData() throws Exception {
        when(authentication.getName()).thenReturn("mama@example.com");
        when(babyGrowthService.getToday("mama@example.com")).thenReturn(response());

        mockMvc.perform(get("/api/v1/baby-growth/today")
                        .principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.screen_title").value("Baby Growth"))
                .andExpect(jsonPath("$.hero_message").value("Your baby is growing beautifully!"))
                .andExpect(jsonPath("$.audio_update.language").value("YORUBA"))
                .andExpect(jsonPath("$.audio_update.audio_url").value("/audio/baby-growth/yoruba/week-24.mp3"))
                .andExpect(jsonPath("$.pregnancy_status.message").value("You are 24 weeks pregnant"))
                .andExpect(jsonPath("$.pregnancy_status.trimester").value("2nd Trimester"))
                .andExpect(jsonPath("$.growth_this_week.length_label").value("30.0 cm"))
                .andExpect(jsonPath("$.growth_this_week.weight_label").value("600 g"))
                .andExpect(jsonPath("$.growth_this_week.heartbeat_label").value("Strong"))
                .andExpect(jsonPath("$.happenings[0].text").value("Baby's lungs are developing."));

        verify(babyGrowthService).getToday("mama@example.com");
    }

    private BabyGrowthResponse response() {
        return new BabyGrowthResponse(
                "Baby Growth",
                "Your baby is growing beautifully!",
                new BabyGrowthResponse.AudioUpdate(
                        "YORUBA",
                        "Listen in Yoruba",
                        75,
                        "/audio/baby-growth/yoruba/week-24.mp3"
                ),
                new BabyGrowthResponse.PregnancyStatus(
                        "You are 24 weeks pregnant",
                        "2nd Trimester",
                        "Week 24",
                        24,
                        108
                ),
                new BabyGrowthResponse.GrowthThisWeek("30.0 cm", "600 g", "Strong"),
                List.of(
                        new BabyGrowthResponse.WeeklyHappening("Baby's lungs are developing."),
                        new BabyGrowthResponse.WeeklyHappening("Baby can hear your voice."),
                        new BabyGrowthResponse.WeeklyHappening("Baby's movement may be stronger.")
                ),
                "Baby growth values are educational estimates."
        );
    }
}
