package com.Mamacare.Backend.CommunityPackage.Entity;

import com.Mamacare.Backend.AuthenticationPackage.user.User;
import com.Mamacare.Backend.CommunityPackage.Enums.CommunityCommentStatus;
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
    name = "community_comments",
    indexes = {
        @Index(name = "idx_community_comments_discussion_created", columnList = "discussion_id, created_at")
    }
)
public class CommunityComment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "discussion_id", nullable = false)
  private CommunityDiscussion discussion;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "author_id", nullable = false)
  private User author;

  @Column(nullable = false, length = 2000)
  private String body;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  @Builder.Default
  private CommunityCommentStatus status = CommunityCommentStatus.PUBLISHED;

  @Column(name = "created_at", nullable = false, updatable = false)
  @Builder.Default
  private Instant createdAt = Instant.now();

  @PrePersist
  void beforeCreate() {
    if (createdAt == null) {
      createdAt = Instant.now();
    }
  }
}
