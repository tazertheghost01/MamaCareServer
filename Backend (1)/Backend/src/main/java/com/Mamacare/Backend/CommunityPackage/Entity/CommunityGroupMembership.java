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
    name = "community_group_memberships",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_community_group_user",
        columnNames = {"group_id", "user_id"}
    ),
    indexes = {
        @Index(name = "idx_community_group_memberships_user", columnList = "user_id"),
        @Index(name = "idx_community_group_memberships_group", columnList = "group_id")
    }
)
public class CommunityGroupMembership {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "group_id", nullable = false)
  private CommunityGroup group;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  private Instant joinedAt;

  @PrePersist
  void beforeCreate() {
    if (joinedAt == null) {
      joinedAt = Instant.now();
    }
  }
}