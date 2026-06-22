package com.Mamacare.Backend.LearnPackage.Repo;

import com.Mamacare.Backend.LearnPackage.Entity.LearnCard;
import com.Mamacare.Backend.LearnPackage.Enums.LearnCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearnCardRepo extends JpaRepository<LearnCard, String> {
    List<LearnCard> findByCategory(LearnCategory category);
}
