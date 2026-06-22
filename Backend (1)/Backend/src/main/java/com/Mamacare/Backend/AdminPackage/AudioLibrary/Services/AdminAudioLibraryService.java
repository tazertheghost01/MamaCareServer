package com.Mamacare.Backend.AdminPackage.AudioLibrary.Services;

import com.Mamacare.Backend.AdminPackage.AudioLibrary.Dto.AdminAudioAssetResponse;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Entity.AdminAudioAsset;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioCategory;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioLanguage;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioStatus;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Repo.AdminAudioAssetRepository;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Storage.AdminAudioStorageService;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Storage.AdminAudioStoredFile;
import com.Mamacare.Backend.AdminPackage.Common.Dto.AdminMetricCard;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminAudioLibraryService {

    private final AdminAudioAssetRepository audioRepository;
    private final AdminAudioStorageService storageService;

    @Transactional
    public AdminAudioAssetResponse uploadAudio(
            String title,
            AdminAudioCategory category,
            AdminAudioLanguage language,
            Integer durationSeconds,
            MultipartFile file
    ) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Audio title is required.");
        }

        AdminAudioStoredFile storedFile = storageService.store(file, language, category);
        AdminAudioAsset asset = AdminAudioAsset.builder()
                .title(title.trim())
                .category(category)
                .language(language)
                .durationSeconds(durationSeconds)
                .originalFilename(storedFile.originalFilename())
                .storedFilename(storedFile.storedFilename())
                .relativePath(storedFile.relativePath())
                .contentType(storedFile.contentType())
                .fileSizeBytes(storedFile.fileSizeBytes())
                .status(AdminAudioStatus.DRAFT)
                .publicUrl("/api/v1/audio-library/" + 0 + "/file")
                .build();

        AdminAudioAsset saved = audioRepository.save(asset);
        saved.setPublicUrl("/api/v1/audio-library/" + saved.getId() + "/file");
        return toResponse(audioRepository.save(saved));
    }

    @Transactional(readOnly = true)
    public List<AdminMetricCard> getStats() {
        return List.of(
                new AdminMetricCard("total_audio", "Total Audio", audioRepository.count(), "All time"),
                new AdminMetricCard("published", "Published", audioRepository.countByStatus(AdminAudioStatus.PUBLISHED), "Available to users"),
                new AdminMetricCard("drafts", "Drafts", audioRepository.countByStatus(AdminAudioStatus.DRAFT), "Needs review"),
                new AdminMetricCard("archived", "Archived", audioRepository.countByStatus(AdminAudioStatus.ARCHIVED), "Hidden from users")
        );
    }

    @Transactional(readOnly = true)
    public List<AdminAudioAssetResponse> listAudio(
            AdminAudioCategory category,
            AdminAudioLanguage language,
            AdminAudioStatus status
    ) {
        return audioRepository.findAll()
                .stream()
                .filter(asset -> category == null || asset.getCategory() == category)
                .filter(asset -> language == null || asset.getLanguage() == language)
                .filter(asset -> status == null || asset.getStatus() == status)
                .sorted((left, right) -> right.getUpdatedAt().compareTo(left.getUpdatedAt()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminAudioAssetResponse updateStatus(Long audioId, AdminAudioStatus status) {
        AdminAudioAsset asset = getAudioAsset(audioId);
        asset.setStatus(status);
        return toResponse(audioRepository.save(asset));
    }

    @Transactional(readOnly = true)
    public Resource loadFile(Long audioId) {
        return storageService.loadAsResource(getAudioAsset(audioId));
    }

    @Transactional(readOnly = true)
    public AdminAudioAsset getAudioAsset(Long audioId) {
        return audioRepository.findById(audioId)
                .orElseThrow(() -> new IllegalArgumentException("Audio asset not found."));
    }

    AdminAudioAssetResponse toResponse(AdminAudioAsset asset) {
        return new AdminAudioAssetResponse(
                asset.getId(),
                asset.getTitle(),
                asset.getCategory(),
                asset.getLanguage(),
                asset.getStatus(),
                asset.getOriginalFilename(),
                asset.getContentType(),
                asset.getFileSizeBytes(),
                asset.getDurationSeconds(),
                asset.getPublicUrl(),
                asset.getCreatedAt(),
                asset.getUpdatedAt()
        );
    }
}
