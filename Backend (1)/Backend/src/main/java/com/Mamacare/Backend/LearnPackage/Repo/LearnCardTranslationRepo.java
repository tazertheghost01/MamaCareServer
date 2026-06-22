package com.Mamacare.Backend.LearnPackage.Repo;

import com.Mamacare.Backend.LearnPackage.Entity.LearnCardTranslation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LearnCardTranslationRepo extends JpaRepository<LearnCardTranslation, Long> {
    Optional<LearnCardTranslation> findByLearnCardIdAndLanguage(String cardId, String language);
}
