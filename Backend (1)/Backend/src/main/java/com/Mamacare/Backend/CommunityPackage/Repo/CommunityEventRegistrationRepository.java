package com.Mamacare.Backend.CommunityPackage.Repo;

import com.Mamacare.Backend.CommunityPackage.Entity.CommunityEventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommunityEventRegistrationRepository extends JpaRepository<CommunityEventRegistration, Long> {

  Optional<CommunityEventRegistration> findByEvent_IdAndUser_Email(Long eventId, String email);

  long countByEvent_Id(Long eventId);
}
