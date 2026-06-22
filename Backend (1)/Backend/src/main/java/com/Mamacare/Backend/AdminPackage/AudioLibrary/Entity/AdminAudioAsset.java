package com.Mamacare.Backend.AdminPackage.AudioLibrary.Entity;

import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioCategory;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioLanguage;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "admin_audio_assets",
        indexes = {
                @Index(name = "idx_admin_audio_language_status", columnList = "language, status"),
                @Index(name = "idx_admin_audio_category_language", columnList = "category, language")
        }
)
public class AdminAudioAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 160)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private AdminAudioCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AdminAudioLanguage language;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AdminAudioStatus status = AdminAudioStatus.DRAFT;

    @Column(name = "original_filename", nullable = false, length = 255)
    private String originalFilename;

    @Column(name = "stored_filename", nullable = false, length = 255)
    private String storedFilename;

    @Column(name = "relative_path", nullable = false, length = 600)
    private String relativePath;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "file_size_bytes", nullable = false)
    private long fileSizeBytes;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "public_url", nullable = false, length = 600)
    private String publicUrl;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PrePersist
    void beforeCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    void beforeUpdate() {
        updatedAt = Instant.now();
    }
}
