package com.Mamacare.Backend.PregnancyCalculationPackage.Controller;

import com.Mamacare.Backend.Commons.Storage.StorageService;
import com.Mamacare.Backend.PregnancyCalculationPackage.Entity.PregnancyWeeklyAudio;
import com.Mamacare.Backend.PregnancyCalculationPackage.Entity.PregnancyWeeklyAudioTranslation;
import com.Mamacare.Backend.PregnancyCalculationPackage.Repo.PregnancyWeeklyAudioRepo;
import com.Mamacare.Backend.PregnancyCalculationPackage.Repo.PregnancyWeeklyAudioTranslationRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/admin/pregnancy/weekly-audio")
@RequiredArgsConstructor
public class AdminPregnancyWeeklyAudioController {

    private final PregnancyWeeklyAudioRepo weeklyAudioRepo;
    private final PregnancyWeeklyAudioTranslationRepo translationRepo;
    private final StorageService storageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PregnancyWeeklyAudioTranslation> saveWeeklyAudio(
            @RequestParam int week,
            @RequestParam String language,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestPart MultipartFile audioFile
    ) {
        if (audioFile == null || audioFile.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String audioUrl = storageService.uploadFile(audioFile, "pregnancy-weekly");

        PregnancyWeeklyAudio weeklyAudio = weeklyAudioRepo.findByWeekNumber(week)
                .orElseGet(() -> weeklyAudioRepo.save(
                        PregnancyWeeklyAudio.builder().weekNumber(week).build()
                ));

        String langUpper = language.trim().toUpperCase();
        Optional<PregnancyWeeklyAudioTranslation> transOpt = 
                translationRepo.findByWeeklyAudioIdAndLanguage(weeklyAudio.getId(), langUpper);

        PregnancyWeeklyAudioTranslation translation;
        if (transOpt.isPresent()) {
            translation = transOpt.get();
            translation.setAudioUrl(audioUrl);
            if (title != null) translation.setTitle(title);
            if (description != null) translation.setDescription(description);
        } else {
            translation = PregnancyWeeklyAudioTranslation.builder()
                    .weeklyAudio(weeklyAudio)
                    .language(langUpper)
                    .title(title)
                    .description(description)
                    .audioUrl(audioUrl)
                    .build();
        }

        return ResponseEntity.ok(translationRepo.save(translation));
    }
}
