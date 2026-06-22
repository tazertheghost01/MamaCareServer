package com.Mamacare.Backend.PregnancyCalculationPackage.Repo;
import com.Mamacare.Backend.AuthenticationPackage.user.User;
import com.Mamacare.Backend.PregnancyCalculationPackage.Entity.PregnancyProfile;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PregnancyProfileRepository extends JpaRepository<PregnancyProfile, Long> {
  Optional<PregnancyProfile> findByUser(User user);

  List<PregnancyProfile> findTop20ByOrderByIdDesc();

    
} 
