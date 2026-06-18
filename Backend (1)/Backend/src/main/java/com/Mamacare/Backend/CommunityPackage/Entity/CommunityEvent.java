package com.Mamacare.Backend.CommunityPackage.Entity;

import com.Mamacare.Backend.CommunityPackage.Enums.CommunityEventStatus;
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
    name = "community_events",
    indexes = {
        @Index(name = "idx_community_events_status_starts", columnList = "status, starts_at")
    }
)
public class CommunityEvent {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 180)
  private String title;

  @Column(length = 3000)
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private CommunityEventStatus status;

  @Column(name = "starts_at", nullable = false)
  private Instant startsAt;

  @Column(nullable = false)
  @Builder.Default
  private boolean active = true;

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
