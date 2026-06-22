package com.Mamacare.Backend.LearnPackage.Entity;

import com.Mamacare.Backend.LearnPackage.Enums.LearnCategory;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "learn_cards")
public class LearnCard {

    @Id
    @Column(nullable = false, length = 100)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private LearnCategory category;

    @Column(name = "duration_seconds", nullable = false)
    @Builder.Default
    private int durationSeconds = 75;

    @OneToMany(mappedBy = "learnCard", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<LearnCardTranslation> translations = new ArrayList<>();
}
