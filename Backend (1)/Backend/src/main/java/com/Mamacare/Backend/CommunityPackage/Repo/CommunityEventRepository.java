package com.Mamacare.Backend.CommunityPackage.Repo;

import com.Mamacare.Backend.CommunityPackage.Entity.CommunityEvent;
import com.Mamacare.Backend.CommunityPackage.Enums.CommunityEventStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface CommunityEventRepository extends JpaRepository<CommunityEvent, Long> {

  boolean existsByTitle(String title);

  Optional<CommunityEvent> findFirstByActiveTrueAndStatusOrderByStartsAtAsc(CommunityEventStatus status);

  Optional<CommunityEvent> findFirstByActiveTrueAndStatusAndStartsAtAfterOrderByStartsAtAsc(
      CommunityEventStatus status,
      Instant startsAt
  );
}
