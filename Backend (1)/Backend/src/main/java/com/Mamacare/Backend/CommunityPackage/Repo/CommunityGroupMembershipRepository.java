package com.Mamacare.Backend.CommunityPackage.Repo;

import com.Mamacare.Backend.CommunityPackage.Entity.CommunityGroupMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface CommunityGroupMembershipRepository extends JpaRepository<CommunityGroupMembership, Long> {

  Optional<CommunityGroupMembership> findByGroup_IdAndUser_Email(Long groupId, String email);

  long countByGroup_Id(Long groupId);

  @Query("""
      select m.group.id as groupId, count(m.id) as memberCount
      from CommunityGroupMembership m
      where m.group.id in :groupIds
      group by m.group.id
      """)
  List<GroupMemberCountView> countMembersByGroupIds(@Param("groupIds") Collection<Long> groupIds);

  @Query("""
      select m.group.id
      from CommunityGroupMembership m
      where m.user.email = :email
      and m.group.id in :groupIds
      """)
  Set<Long> findJoinedGroupIds(
      @Param("email") String email,
      @Param("groupIds") Collection<Long> groupIds
  );
}
