package com.Mamacare.Backend.CommunityPackage.Entity;

import com.Mamacare.Backend.AuthenticationPackage.user.User;
import com.Mamacare.Backend.CommunityPackage.Enums.CommunityDiscussionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
    name = "community_discussions",
    indexes = {
        @Index(name = "idx_community_discussions_status_created", columnList = "status, created_at"),
        @Index(name = "idx_community_discussions_group", columnList = "group_id")
    }
)
public class CommunityDiscussion {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "group_id", nullable = false)
  private CommunityGroup group;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "author_id", nullable = false)
  private User author;

  @Column(nullable = false, length = 180)
  private String title;

  @Column(length = 3000)
  private String body;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  @Builder.Default
  private CommunityDiscussionStatus status = CommunityDiscussionStatus.PUBLISHED;

  @Column(nullable = false)
  @Builder.Default
  private long commentCount = 0;

  @Column(nullable = false)
  @Builder.Default
  private long reactionCount = 0;

  @Column(name = "created_at", nullable = false, updatable = false)
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
