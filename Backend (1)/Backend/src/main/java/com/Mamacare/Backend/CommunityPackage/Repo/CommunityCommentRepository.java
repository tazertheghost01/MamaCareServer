package com.Mamacare.Backend.CommunityPackage.Repo;

import com.Mamacare.Backend.CommunityPackage.Entity.CommunityComment;
import com.Mamacare.Backend.CommunityPackage.Enums.CommunityCommentStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityCommentRepository extends JpaRepository<CommunityComment, Long> {

  List<CommunityComment> findByDiscussion_IdAndStatusOrderByCreatedAtAsc(
      Long discussionId,
      CommunityCommentStatus status,
      Pageable pageable
  );
}
