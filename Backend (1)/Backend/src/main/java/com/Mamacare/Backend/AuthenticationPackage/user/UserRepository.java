package com.Mamacare.Backend.AuthenticationPackage.user;

import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {

  Optional<User> findByEmail(String email);

  boolean existsByEmail(String email);

  long countByEnabled(boolean enabled);

  List<User> findTop5ByOrderByIdDesc();

}
