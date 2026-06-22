package com.Mamacare.Backend.PreferencesPackage.Entity;

import com.Mamacare.Backend.AuthenticationPackage.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
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
        name = "user_preferences",
        indexes = {
                @Index(name = "idx_user_preferences_user", columnList = "user_id", unique = true)
        }
)
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String language = "ENGLISH";

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String timezone = "Africa/Lagos";

    @Column(nullable = false)
    @Builder.Default
    private boolean notificationsEnabled = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean appointmentRemindersEnabled = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean medicationRemindersEnabled = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean dailyGoalRemindersEnabled = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean communityNotificationsEnabled = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean privacyConsentAccepted = false;

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
