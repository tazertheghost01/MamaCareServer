package com.Mamacare.Backend.LearnPackage.Controller;

import com.Mamacare.Backend.Commons.Storage.StorageService;
import com.Mamacare.Backend.LearnPackage.Entity.LearnCard;
import com.Mamacare.Backend.LearnPackage.Entity.LearnCardTranslation;
import com.Mamacare.Backend.LearnPackage.Enums.LearnCategory;
import com.Mamacare.Backend.LearnPackage.Repo.LearnCardRepo;
import com.Mamacare.Backend.LearnPackage.Repo.LearnCardTranslationRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/admin/learn")
@RequiredArgsConstructor
public class AdminLearnController {

    private final LearnCardRepo learnCardRepo;
    private final LearnCardTranslationRepo translationRepo;
    private final StorageService storageService;

    @PostMapping("/cards")
    public ResponseEntity<LearnCard> createCard(
            @RequestParam String id,
            @RequestParam LearnCategory category,
            @RequestParam(defaultValue = "75") int durationSeconds
    ) {
        if (learnCardRepo.existsById(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        LearnCard card = LearnCard.builder()
                .id(id)
                .category(category)
                .durationSeconds(durationSeconds)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(learnCardRepo.save(card));
    }

    @PostMapping(value = "/cards/{cardId}/translations", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LearnCardTranslation> saveTranslation(
            @PathVariable String cardId,
            @RequestParam String language,
            @RequestParam String title,
            @RequestParam String body,
            @RequestPart(required = false) MultipartFile audioFile
    ) {
        Optional<LearnCard> cardOpt = learnCardRepo.findById(cardId);
        if (cardOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        LearnCard card = cardOpt.get();

        String audioUrl = null;
        if (audioFile != null && !audioFile.isEmpty()) {
            audioUrl = storageService.uploadFile(audioFile, "learn-tips");
        }

        String langUpper = language.trim().toUpperCase();
        Optional<LearnCardTranslation> transOpt = translationRepo.findByLearnCardIdAndLanguage(cardId, langUpper);

        LearnCardTranslation translation;
        if (transOpt.isPresent()) {
            translation = transOpt.get();
            translation.setTitle(title);
            translation.setBody(body);
            if (audioUrl != null) {
                translation.setAudioUrl(audioUrl);
            }
        } else {
            translation = LearnCardTranslation.builder()
                    .learnCard(card)
                    .language(langUpper)
                    .title(title)
                    .body(body)
                    .audioUrl(audioUrl)
                    .build();
        }

        return ResponseEntity.ok(translationRepo.save(translation));
    }

    @PutMapping("/cards/{cardId}")
    public ResponseEntity<LearnCard> updateCard(
            @PathVariable String cardId,
            @RequestParam(required = false) LearnCategory category,
            @RequestParam(required = false) Integer durationSeconds
    ) {
        Optional<LearnCard> cardOpt = learnCardRepo.findById(cardId);
        if (cardOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        LearnCard card = cardOpt.get();
        if (category != null) {
            card.setCategory(category);
        }
        if (durationSeconds != null) {
            card.setDurationSeconds(durationSeconds);
        }
        return ResponseEntity.ok(learnCardRepo.save(card));
    }

    @DeleteMapping("/cards/{cardId}")
    public ResponseEntity<Void> deleteCard(@PathVariable String cardId) {
        if (!learnCardRepo.existsById(cardId)) {
            return ResponseEntity.notFound().build();
        }
        learnCardRepo.deleteById(cardId);
        return ResponseEntity.noContent().build();
    }
}
