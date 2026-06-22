package com.Mamacare.Backend.PregnancyCalculationPackage.Controller;

import com.Mamacare.Backend.PregnancyCalculationPackage.Services.PregnancyWeeklyAudioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/pregnancy/weekly-audio")
@RequiredArgsConstructor
public class PregnancyWeeklyAudioController {

    private final PregnancyWeeklyAudioService weeklyAudioService;

    @GetMapping
    public ResponseEntity<Map<String, String>> getWeeklyAudio(
            @RequestParam int week,
            @RequestParam(required = false) String lang,
            Authentication authentication
    ) {
        String audioUrl = weeklyAudioService.getWeeklyAudioUrl(week, lang, authentication);
        return ResponseEntity.ok(Map.of("audio_url", audioUrl));
    }
}
