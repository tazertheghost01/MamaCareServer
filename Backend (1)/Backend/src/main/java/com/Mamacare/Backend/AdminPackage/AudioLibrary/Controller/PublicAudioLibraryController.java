package com.Mamacare.Backend.AdminPackage.AudioLibrary.Controller;

import com.Mamacare.Backend.AdminPackage.AudioLibrary.Dto.PublicAudioAssetResponse;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioCategory;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Services.PublicAudioLibraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audio-library")
@RequiredArgsConstructor
public class PublicAudioLibraryController {

    private final PublicAudioLibraryService audioLibraryService;

    @GetMapping("/me")
    public ResponseEntity<List<PublicAudioAssetResponse>> getMyAudio(
            @RequestParam(required = false) AdminAudioCategory category,
            Authentication authentication
    ) {
        return ResponseEntity.ok(audioLibraryService.getMyAudio(category, authentication));
    }

    @GetMapping("/{audioId}/file")
    public ResponseEntity<Resource> getPublishedAudioFile(@PathVariable Long audioId) {
        Resource file = audioLibraryService.loadPublishedFile(audioId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }
}
