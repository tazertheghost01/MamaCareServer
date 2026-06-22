package com.Mamacare.Backend.AdminPackage.AudioLibrary.Controller;

import com.Mamacare.Backend.AdminPackage.AudioLibrary.Dto.AdminAudioAssetResponse;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioCategory;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioLanguage;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioStatus;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Services.AdminAudioLibraryService;
import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminMetricCard;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/audio-library")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAudioLibraryController {

    private final AdminAudioLibraryService audioLibraryService;

    @GetMapping("/stats")
    public ResponseEntity<List<AdminMetricCard>> getStats() {
        return ResponseEntity.ok(audioLibraryService.getStats());
    }

    @GetMapping
    public ResponseEntity<List<AdminAudioAssetResponse>> listAudio(
            @RequestParam(required = false) AdminAudioCategory category,
            @RequestParam(required = false) AdminAudioLanguage language,
            @RequestParam(required = false) AdminAudioStatus status
    ) {
        return ResponseEntity.ok(audioLibraryService.listAudio(category, language, status));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AdminAudioAssetResponse> uploadAudio(
            @RequestParam String title,
            @RequestParam AdminAudioCategory category,
            @RequestParam AdminAudioLanguage language,
            @RequestParam(required = false) Integer durationSeconds,
            @RequestParam MultipartFile file
    ) {
        return ResponseEntity.ok(audioLibraryService.uploadAudio(title, category, language, durationSeconds, file));
    }

    @PatchMapping("/{audioId}/status")
    public ResponseEntity<AdminAudioAssetResponse> updateStatus(
            @PathVariable Long audioId,
            @RequestParam AdminAudioStatus status
    ) {
        return ResponseEntity.ok(audioLibraryService.updateStatus(audioId, status));
    }

    @GetMapping("/{audioId}/file")
    public ResponseEntity<Resource> getAdminAudioFile(@PathVariable Long audioId) {
        Resource file = audioLibraryService.loadFile(audioId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }
}
