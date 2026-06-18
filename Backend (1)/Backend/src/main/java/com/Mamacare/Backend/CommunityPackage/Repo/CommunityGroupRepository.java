package com.Mamacare.Backend.CommunityPackage.Repo;

import com.Mamacare.Backend.CommunityPackage.Entity.CommunityGroup;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommunityGroupRepository extends JpaRepository<CommunityGroup, Long> {

  boolean existsBySlug(String slug);

  List<CommunityGroup> findTop3ByActiveTrueOrderBySortOrderAscNameAsc();

  @Query("""
      select g from CommunityGroup g
      where g.active = true
      and lower(g.name) like lower(concat('%', :query, '%'))
      order by g.name asc
      """)
  List<CommunityGroup> search(@Param("query") String query, Pageable pageable);
}
