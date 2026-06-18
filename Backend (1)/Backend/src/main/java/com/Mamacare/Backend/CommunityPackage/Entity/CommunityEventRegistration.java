package com.Mamacare.Backend.CommunityPackage.Entity;

import com.Mamacare.Backend.AuthenticationPackage.user.User;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
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
    name = "community_event_registrations",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_community_event_user",
        columnNames = {"event_id", "user_id"}
    ),
    indexes = {
        @Index(name = "idx_community_event_registrations_event", columnList = "event_id"),
        @Index(name = "idx_community_event_registrations_user", columnList = "user_id")
    }
)
public class CommunityEventRegistration {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "event_id", nullable = false)
  private CommunityEvent event;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  private Instant registeredAt;

  @PrePersist
  void beforeCreate() {
    if (registeredAt == null) {
      registeredAt = Instant.now();
    }
  }
}
