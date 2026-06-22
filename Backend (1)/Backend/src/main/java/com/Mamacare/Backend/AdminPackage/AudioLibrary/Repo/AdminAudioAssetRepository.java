package com.Mamacare.Backend.AdminPackage.AudioLibrary.Repo;

import com.Mamacare.Backend.AdminPackage.AudioLibrary.Entity.AdminAudioAsset;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioCategory;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioLanguage;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AdminAudioAssetRepository extends JpaRepository<AdminAudioAsset, Long> {

    long countByStatus(AdminAudioStatus status);

    long countByLanguage(AdminAudioLanguage language);

    List<AdminAudioAsset> findByStatusOrderByUpdatedAtDesc(AdminAudioStatus status);

    List<AdminAudioAsset> findByLanguageAndStatusOrderByUpdatedAtDesc(
            AdminAudioLanguage language,
            AdminAudioStatus status
    );

    List<AdminAudioAsset> findByLanguageAndCategoryAndStatusOrderByUpdatedAtDesc(
            AdminAudioLanguage language,
            AdminAudioCategory category,
            AdminAudioStatus status
    );

    Optional<AdminAudioAsset> findFirstByLanguageAndCategoryAndStatusOrderByUpdatedAtDesc(
            AdminAudioLanguage language,
            AdminAudioCategory category,
            AdminAudioStatus status
    );
}
