package com.Mamacare.Backend.CommunityPackage.Repo;

import com.Mamacare.Backend.CommunityPackage.Entity.CommunityDiscussion;
import com.Mamacare.Backend.CommunityPackage.Enums.CommunityDiscussionStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommunityDiscussionRepository extends JpaRepository<CommunityDiscussion, Long> {

  List<CommunityDiscussion> findTop3ByStatusOrderByCommentCountDescCreatedAtDesc(
      CommunityDiscussionStatus status
  );

  long countByStatus(CommunityDiscussionStatus status);

  List<CommunityDiscussion> findTop20ByOrderByCreatedAtDesc();

  @Query("""
      select d from CommunityDiscussion d
      join d.group g
      join d.author a
      where d.status = :status
      and (
        lower(d.title) like lower(concat('%', :query, '%'))
        or lower(coalesce(d.body, '')) like lower(concat('%', :query, '%'))
        or lower(g.name) like lower(concat('%', :query, '%'))
        or lower(coalesce(a.fullname, '')) like lower(concat('%', :query, '%'))
      )
      order by d.createdAt desc
      """)
  List<CommunityDiscussion> search(
      @Param("query") String query,
      @Param("status") CommunityDiscussionStatus status,
      Pageable pageable
  );
}
