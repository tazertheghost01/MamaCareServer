package com.Mamacare.Backend.AdminPackage.AudioLibrary.Services;

import com.Mamacare.Backend.AdminPackage.AudioLibrary.Dto.PublicAudioAssetResponse;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Entity.AdminAudioAsset;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioCategory;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioLanguage;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioStatus;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Repo.AdminAudioAssetRepository;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Storage.AdminAudioStorageService;
import com.Mamacare.Backend.AuthenticationPackage.user.User;
import com.Mamacare.Backend.PreferencesPackage.Repo.UserPreferenceRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicAudioLibraryService {

    private final AdminAudioAssetRepository audioRepository;
    private final AdminAudioStorageService storageService;
    private final UserPreferenceRepo preferenceRepository;

    @Transactional(readOnly = true)
    public List<PublicAudioAssetResponse> getMyAudio(AdminAudioCategory category, Authentication authentication) {
        AdminAudioLanguage language = preferredLanguage(authentication);

        List<AdminAudioAsset> assets = category == null
                ? audioRepository.findByLanguageAndStatusOrderByUpdatedAtDesc(language, AdminAudioStatus.PUBLISHED)
                : audioRepository.findByLanguageAndCategoryAndStatusOrderByUpdatedAtDesc(
                        language,
                        category,
                        AdminAudioStatus.PUBLISHED
                );

        return assets.stream().map(this::toPublicResponse).toList();
    }

    @Transactional(readOnly = true)
    public Resource loadPublishedFile(Long audioId) {
        AdminAudioAsset asset = audioRepository.findById(audioId)
                .filter(found -> found.getStatus() == AdminAudioStatus.PUBLISHED)
                .orElseThrow(() -> new IllegalArgumentException("Published audio asset not found."));
        return storageService.loadAsResource(asset);
    }

    @Transactional(readOnly = true)
    public String audioUrlFor(AdminAudioCategory category, String languageValue, String fallbackUrl) {
        AdminAudioLanguage language = AdminAudioLanguage.from(languageValue);
        return audioRepository.findFirstByLanguageAndCategoryAndStatusOrderByUpdatedAtDesc(
                        language,
                        category,
                        AdminAudioStatus.PUBLISHED
                )
                .map(AdminAudioAsset::getPublicUrl)
                .orElse(fallbackUrl);
    }

    private AdminAudioLanguage preferredLanguage(Authentication authentication) {
        User user = currentUser(authentication);
        String language = preferenceRepository.findByUserId(user.getId())
                .map(preference -> preference.getLanguage())
                .orElse(AdminAudioLanguage.ENGLISH.name());
        return AdminAudioLanguage.from(language);
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new IllegalArgumentException("Authenticated user is required.");
        }
        return user;
    }

    private PublicAudioAssetResponse toPublicResponse(AdminAudioAsset asset) {
        return new PublicAudioAssetResponse(
                asset.getId(),
                asset.getTitle(),
                asset.getCategory(),
                asset.getLanguage(),
                asset.getDurationSeconds(),
                asset.getPublicUrl()
        );
    }
}
