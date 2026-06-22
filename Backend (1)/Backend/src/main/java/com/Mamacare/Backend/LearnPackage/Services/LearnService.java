package com.Mamacare.Backend.LearnPackage.Services;

import com.Mamacare.Backend.LearnPackage.Dto.LearnCardResponse;
import com.Mamacare.Backend.LearnPackage.Dto.LearnHomeResponse;
import com.Mamacare.Backend.LearnPackage.Enums.LearnCategory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LearnService {

    public LearnHomeResponse getHome() {
        List<LearnCardResponse> allCards = getAllCards();

        return new LearnHomeResponse(
                "Learn",
                "MamaCare is your trusted companion through every step of your pregnancy and motherhood journey.",
                allCards.stream().filter(card -> card.category() == LearnCategory.WELLNESS).limit(2).toList(),
                allCards.stream().filter(card -> card.category() == LearnCategory.BABY_GROWTH).limit(2).toList(),
                allCards.stream().filter(card -> card.category() == LearnCategory.NUTRITION).limit(3).toList()
        );
    }

    public List<LearnCardResponse> getTipsByCategory(LearnCategory category) {
        return getAllCards()
                .stream()
                .filter(card -> category == null || card.category() == category)
                .toList();
    }

    public List<LearnCardResponse> getTipsOfTheDay() {
        return getAllCards()
                .stream()
                .filter(card -> card.category() == LearnCategory.WELLNESS || card.category() == LearnCategory.NUTRITION)
                .limit(3)
                .toList();
    }

    private List<LearnCardResponse> getAllCards() {
        return List.of(
                card("eat-fruits-vegetables", "Eat variety of fruits and vegetables everyday.",
                        "Balanced meals give your body vitamins, minerals, and steady energy.",
                        LearnCategory.NUTRITION, "ENGLISH", "/audio/learn/eat-fruits-vegetables-english.mp3"),
                card("stay-hydrated", "Stay Hydrated",
                        "Drink enough water daily unless your clinician gives a different instruction.",
                        LearnCategory.NUTRITION, "ENGLISH", "/audio/learn/stay-hydrated-english.mp3"),
                card("take-with-water", "Take with water",
                        "Water helps many medicines move through the body safely.",
                        LearnCategory.MEDICATION, "ENGLISH", "/audio/learn/take-with-water-english.mp3"),
                card("baby-can-hear", "Baby can hear your voice",
                        "Around the second trimester, many babies begin responding to sound.",
                        LearnCategory.BABY_GROWTH, "ENGLISH", "/audio/learn/baby-can-hear-english.mp3"),
                card("touch-developing", "Your baby's sense of touch is developing",
                        "Growth milestones are estimates, and your clinician remains the source of truth.",
                        LearnCategory.BABY_GROWTH, "ENGLISH", "/audio/learn/touch-developing-english.mp3"),
                card("get-enough-rest", "Get Enough Rest",
                        "Good rest supports a healthy pregnancy and helps your body recover.",
                        LearnCategory.WELLNESS, "ENGLISH", "/audio/learn/get-enough-rest-english.mp3"),
                card("manage-stress", "Manage Stress",
                        "Stay calm, breathe slowly, and ask for support when you need it.",
                        LearnCategory.WELLNESS, "ENGLISH", "/audio/learn/manage-stress-english.mp3")
        );
    }

    private LearnCardResponse card(
            String id,
            String title,
            String body,
            LearnCategory category,
            String language,
            String audioUrl
    ) {
        return new LearnCardResponse(id, title, body, category, 75, language, audioUrl);
    }
}
