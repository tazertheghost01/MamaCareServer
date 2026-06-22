package com.Mamacare.Backend.PregnancyCalculationPackage.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "pregnancy_weekly_audio_translations",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_weekly_audio_lang", columnNames = {"weekly_audio_id", "language"})
        }
)
public class PregnancyWeeklyAudioTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "weekly_audio_id", nullable = false)
    @ToString.Exclude
    private PregnancyWeeklyAudio weeklyAudio;

    @Column(nullable = false, length = 50)
    private String language;

    @Column(length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "audio_url", nullable = false, length = 500)
    private String audioUrl;
}
