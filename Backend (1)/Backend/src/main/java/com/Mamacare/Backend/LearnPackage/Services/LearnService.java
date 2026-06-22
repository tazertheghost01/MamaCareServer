package com.Mamacare.Backend.LearnPackage.Services;

import com.Mamacare.Backend.LearnPackage.Dto.LearnCardResponse;
import com.Mamacare.Backend.LearnPackage.Dto.LearnHomeResponse;
import com.Mamacare.Backend.LearnPackage.Entity.LearnCard;
import com.Mamacare.Backend.LearnPackage.Entity.LearnCardTranslation;
import com.Mamacare.Backend.LearnPackage.Enums.LearnCategory;
import com.Mamacare.Backend.LearnPackage.Repo.LearnCardRepo;
import com.Mamacare.Backend.LearnPackage.Repo.LearnCardTranslationRepo;
import com.Mamacare.Backend.PreferencesPackage.Repo.UserPreferenceRepo;
import com.Mamacare.Backend.PreferencesPackage.Entity.UserPreference;
import com.Mamacare.Backend.AuthenticationPackage.user.User;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import jakarta.annotation.PostConstruct;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LearnService {

    private final LearnCardRepo learnCardRepo;
    private final LearnCardTranslationRepo translationRepo;
    private final UserPreferenceRepo preferenceRepository;

    private record SeedTrans(String language, String title, String body, String audioUrl) {}

    @PostConstruct
    @Transactional
    public void seedDefaultData() {
        if (learnCardRepo.count() == 0) {
            // Seed eat-fruits-vegetables
            createAndSaveSeedCard(
                "eat-fruits-vegetables",
                LearnCategory.NUTRITION,
                75,
                List.of(
                    new SeedTrans("ENGLISH", "Eat variety of fruits and vegetables everyday.", "Balanced meals give your body vitamins, minerals, and steady energy.", "/audio/learn/eat-fruits-vegetables-english.mp3"),
                    new SeedTrans("HAUSA", "Kuna cin nau'ikan 'ya'yan itace da kayan lambu kowace rana.", "Daidaitaccen abinci yana ba jikinku bitamin, ma'adanai, da daidaitaccen ƙarfi.", "/audio/learn/eat-fruits-vegetables-hausa.mp3"),
                    new SeedTrans("IGBO", "Rie ụdị mkpụrụ osisi na akwụkwọ nri dị iche iche kwa ụbọchị.", "Nri kwesịrị ekwesị na-enye ahụ gị vitamin, mineral, na ume kwụsiri ike.", "/audio/learn/eat-fruits-vegetables-igbo.mp3"),
                    new SeedTrans("YORUBA", "Jẹ oniruuru awọn eso ati ẹfọ lojoojumọ.", "Ounje to peye n fun ara rẹ ni awọn vitamin, awọn ohun alumọni, ati agbara to daju.", "/audio/learn/eat-fruits-vegetables-yoruba.mp3"),
                    new SeedTrans("PIDGIN", "De eat different-different fruits and vegetables everyday.", "Correct food dey give your bodi vitamins, minerals, and steady energy.", "/audio/learn/eat-fruits-vegetables-pidgin.mp3")
                )
            );

            // Seed stay-hydrated
            createAndSaveSeedCard(
                "stay-hydrated",
                LearnCategory.NUTRITION,
                75,
                List.of(
                    new SeedTrans("ENGLISH", "Stay Hydrated", "Drink enough water daily unless your clinician gives a different instruction.", "/audio/learn/stay-hydrated-english.mp3"),
                    new SeedTrans("HAUSA", "Kasance da isasshen ruwa a jiki", "Sha isasshen ruwa kowace rana sai dai idan likitanka ya ba da wani umarni na daban.", "/audio/learn/stay-hydrated-hausa.mp3"),
                    new SeedTrans("IGBO", "Na-aṅụ mmiri nke ọma", "Na-aṅụ mmiri zuru ezu kwa ụbọchị ma ọ gwara ma dọkịta gị enye gị ntuziaka ọzọ.", "/audio/learn/stay-hydrated-igbo.mp3"),
                    new SeedTrans("YORUBA", "Gba omi to pọ to lojoojumọ", "Mu omi to to lojoojumọ afi ti dokita rẹ ba fun ọ ni ilana miiran.", "/audio/learn/stay-hydrated-yoruba.mp3"),
                    new SeedTrans("PIDGIN", "Drink plenty water", "De drink enough water everyday unless your doctor tell you another thing.", "/audio/learn/stay-hydrated-pidgin.mp3")
                )
            );

            // Seed take-with-water
            createAndSaveSeedCard(
                "take-with-water",
                LearnCategory.MEDICATION,
                75,
                List.of(
                    new SeedTrans("ENGLISH", "Take with water", "Water helps many medicines move through the body safely.", "/audio/learn/take-with-water-english.mp3"),
                    new SeedTrans("HAUSA", "Sha da ruwa", "Ruwa yana taimaka wa magunguna da yawa don su ratsa jiki cikin aminci.", "/audio/learn/take-with-water-hausa.mp3"),
                    new SeedTrans("IGBO", "Were mmiri ṅụọ ya", "Mmiri na-enyere ọtụtụ ọgwụ aka ịgafe n'ahụ n'enweghị nsogbu.", "/audio/learn/take-with-water-igbo.mp3"),
                    new SeedTrans("YORUBA", "Fi omi mu un", "Omi n ran ọpọlọpọ oogun lọwọ lati gba inu ara kọja lailewu.", "/audio/learn/take-with-water-yoruba.mp3"),
                    new SeedTrans("PIDGIN", "Take am with water", "Water dey help many medicine waka well for inside body without wahala.", "/audio/learn/take-with-water-pidgin.mp3")
                )
            );

            // Seed baby-can-hear
            createAndSaveSeedCard(
                "baby-can-hear",
                LearnCategory.BABY_GROWTH,
                75,
                List.of(
                    new SeedTrans("ENGLISH", "Baby can hear your voice", "Around the second trimester, many babies begin responding to sound.", "/audio/learn/baby-can-hear-english.mp3"),
                    new SeedTrans("HAUSA", "Jariri yana iya jin muryarku", "Kusan cikin zangon haihuwa na biyu, jarirai da yawa suna fara amsa sauti.", "/audio/learn/baby-can-hear-hausa.mp3"),
                    new SeedTrans("IGBO", "Nwa gị nwere ike ịnụ olu gị", "N'ihe dị ka ọnwa atọ nke abụọ nke afọ ime, ọtụtụ ụmụ ọhụrụ na-amalite ịzaghachi ụda.", "/audio/learn/baby-can-hear-igbo.mp3"),
                    new SeedTrans("YORUBA", "Ọmọ rẹ le gbọ ohùn rẹ", "Ni nkan bi abala keji ti oyun, ọpọlọpọ awọn ọmọ a maa bẹrẹ si dahun si ohun.", "/audio/learn/baby-can-hear-yoruba.mp3"),
                    new SeedTrans("PIDGIN", "Baby fit hear your voice", "Around second trimester, many babies de start to respond to sound.", "/audio/learn/baby-can-hear-pidgin.mp3")
                )
            );

            // Seed touch-developing
            createAndSaveSeedCard(
                "touch-developing",
                LearnCategory.BABY_GROWTH,
                75,
                List.of(
                    new SeedTrans("ENGLISH", "Your baby's sense of touch is developing", "Growth milestones are estimates, and your clinician remains the source of truth.", "/audio/learn/touch-developing-english.mp3"),
                    new SeedTrans("HAUSA", "Halin taɓawa na jaririnku yana haɓaka", "Matakan girma ƙididdiga ne kawai, kuma likitanku ne koyaushe majiyar gaskiya.", "/audio/learn/touch-developing-hausa.mp3"),
                    new SeedTrans("IGBO", "Mmetụta nwa gị na-etolite", "Usoro uto bụ atụmatụ, dọkịta gị ka bụ onye nwere eziokwu ahù.", "/audio/learn/touch-developing-igbo.mp3"),
                    new SeedTrans("YORUBA", "Imọlara ọmọ rẹ ti n dagba", "Àwọn àmì ìdàgbàsókè jẹ́ àbájáde ìfojúsọ́nà, dọkíta rẹ sì ni orísun òtítọ́.", "/audio/learn/touch-developing-yoruba.mp3"),
                    new SeedTrans("PIDGIN", "Your baby sense of touch de develop", "How baby de grow na estimate, and your doctor remain the main person to tell you truth.", "/audio/learn/touch-developing-pidgin.mp3")
                )
            );

            // Seed get-enough-rest
            createAndSaveSeedCard(
                "get-enough-rest",
                LearnCategory.WELLNESS,
                75,
                List.of(
                    new SeedTrans("ENGLISH", "Get Enough Rest", "Good rest supports a healthy pregnancy and helps your body recover.", "/audio/learn/get-enough-rest-english.mp3"),
                    new SeedTrans("HAUSA", "Sami isasshen hutu", "Hutu mai kyau yana tallafawa cikin koshin lafiya kuma yana taimaka wa jikinku wajen farfadowa.", "/audio/learn/get-enough-rest-hausa.mp3"),
                    new SeedTrans("IGBO", "Zuo ike nke ọma", "Ezigbo izu ike na-akwado afọ ime dị mma ma na-enyere ahụ gị aka gbakee.", "/audio/learn/get-enough-rest-igbo.mp3"),
                    new SeedTrans("YORUBA", "Gba isinmi to pọ", "Isinmi to dara n ṣe atilẹyin fun oyun to ni ilera ati pe o n ran ara rẹ lọwọ lati bọsipò.", "/audio/learn/get-enough-rest-yoruba.mp3"),
                    new SeedTrans("PIDGIN", "Rest well-well", "Better rest dey support healthy pregnancy and e de help your body recover.", "/audio/learn/get-enough-rest-pidgin.mp3")
                )
            );

            // Seed manage-stress
            createAndSaveSeedCard(
                "manage-stress",
                LearnCategory.WELLNESS,
                75,
                List.of(
                    new SeedTrans("ENGLISH", "Manage Stress", "Stay calm, breathe slowly, and ask for support when you need it.", "/audio/learn/manage-stress-english.mp3"),
                    new SeedTrans("HAUSA", "Gudanar da damuwa", "Kwantar da hankali, yi numfashi a hankali, kuma nemi taimako lokacin da kuke buƙata.", "/audio/learn/manage-stress-hausa.mp3"),
                    new SeedTrans("IGBO", "Nwee njikwa na nchekasị", "Jụụ, kuo ume nwayọ, ma rịọ maka nkwado mgye ọ bụla ị chọrọ ya.", "/audio/learn/manage-stress-igbo.mp3"),
                    new SeedTrans("YORUBA", "Kari aago ara rẹ lati dinku aapọn", "Farabalẹ, mi rọra, ki o si beere fun iranlọwọ nigbati o ba nilo rẹ.", "/audio/learn/manage-stress-yoruba.mp3"),
                    new SeedTrans("PIDGIN", "Manage your tension/stress", "Cool down, breathe slow-slow, and ask for help when you need am.", "/audio/learn/manage-stress-pidgin.mp3")
                )
            );
        }
    }

    private void createAndSaveSeedCard(String id, LearnCategory category, int duration, List<SeedTrans> seedTranslations) {
        LearnCard card = LearnCard.builder()
                .id(id)
                .category(category)
                .durationSeconds(duration)
                .build();

        List<LearnCardTranslation> translations = seedTranslations.stream()
                .map(st -> LearnCardTranslation.builder()
                        .learnCard(card)
                        .language(st.language())
                        .title(st.title())
                        .body(st.body())
                        .audioUrl(st.audioUrl())
                        .build())
                .toList();

        card.setTranslations(translations);
        learnCardRepo.save(card);
    }

    public String resolveLanguage(String langParam, Authentication authentication) {
        if (langParam != null && !langParam.isBlank()) {
            String norm = langParam.trim().toUpperCase();
            if (List.of("ENGLISH", "HAUSA", "IGBO", "YORUBA", "PIDGIN").contains(norm)) {
                return norm;
            }
        }
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            return preferenceRepository.findByUserId(user.getId())
                    .map(UserPreference::getLanguage)
                    .orElse("ENGLISH");
        }
        return "ENGLISH";
    }

    public LearnHomeResponse getHome() {
        return getHome(getCurrentUserLanguage());
    }

    public List<LearnCardResponse> getTipsByCategory(LearnCategory category) {
        return getTipsByCategory(category, getCurrentUserLanguage());
    }

    public List<LearnCardResponse> getTipsOfTheDay() {
        return getTipsOfTheDay(getCurrentUserLanguage());
    }

    private String getCurrentUserLanguage() {
        org.springframework.security.core.Authentication auth = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            return preferenceRepository.findByUserId(user.getId())
                    .map(UserPreference::getLanguage)
                    .orElse("ENGLISH");
        }
        return "ENGLISH";
    }

    public LearnHomeResponse getHome(String language) {
        List<LearnCardResponse> allCards = getAllCards(language);

        return new LearnHomeResponse(
                translateScreenTitle(language),
                translateHeroMessage(language),
                allCards.stream().filter(card -> card.category() == LearnCategory.WELLNESS).limit(2).toList(),
                allCards.stream().filter(card -> card.category() == LearnCategory.BABY_GROWTH).limit(2).toList(),
                allCards.stream().filter(card -> card.category() == LearnCategory.NUTRITION).limit(3).toList()
        );
    }

    public List<LearnCardResponse> getTipsByCategory(LearnCategory category, String language) {
        return getAllCards(language)
                .stream()
                .filter(card -> category == null || card.category() == category)
                .toList();
    }

    public List<LearnCardResponse> getTipsOfTheDay(String language) {
        return getAllCards(language)
                .stream()
                .filter(card -> card.category() == LearnCategory.WELLNESS || card.category() == LearnCategory.NUTRITION)
                .limit(3)
                .toList();
    }

    private List<LearnCardResponse> getAllCards(String language) {
        String langKey = language == null ? "ENGLISH" : language.toUpperCase().trim();
        if (!List.of("ENGLISH", "HAUSA", "IGBO", "YORUBA", "PIDGIN").contains(langKey)) {
            langKey = "ENGLISH";
        }

        final String finalLangKey = langKey;
        List<LearnCard> cards = learnCardRepo.findAll();

        return cards.stream()
                .map(card -> mapToResponse(card, finalLangKey))
                .toList();
    }

    private LearnCardResponse mapToResponse(LearnCard card, String langKey) {
        // Look for the preferred translation
        Optional<LearnCardTranslation> translationOpt = card.getTranslations().stream()
                .filter(t -> t.getLanguage().equalsIgnoreCase(langKey))
                .findFirst();

        // Fall back to ENGLISH if preferred translation is missing
        if (translationOpt.isEmpty() && !langKey.equalsIgnoreCase("ENGLISH")) {
            translationOpt = card.getTranslations().stream()
                    .filter(t -> t.getLanguage().equalsIgnoreCase("ENGLISH"))
                    .findFirst();
        }

        String title = card.getId();
        String body = "";
        String audioUrl = null;
        String resolvedLanguage = langKey;

        if (translationOpt.isPresent()) {
            LearnCardTranslation trans = translationOpt.get();
            title = trans.getTitle();
            body = trans.getBody();
            audioUrl = trans.getAudioUrl();
            resolvedLanguage = trans.getLanguage();
        }

        return new LearnCardResponse(
                card.getId(),
                title,
                body,
                card.getCategory(),
                card.getDurationSeconds(),
                resolvedLanguage,
                audioUrl
        );
    }

    private String translateScreenTitle(String language) {
        if (language == null) return "Learn";
        return switch (language.toUpperCase().trim()) {
            case "HAUSA" -> "Koya";
            case "IGBO" -> "Mụta";
            case "YORUBA" -> "Kọ ẹkọ";
            default -> "Learn";
        };
    }

    private String translateHeroMessage(String language) {
        if (language == null) return "MamaCare is your trusted companion through every step of your pregnancy and motherhood journey.";
        return switch (language.toUpperCase().trim()) {
            case "HAUSA" -> "MamaCare abokin tarayya ne amintacce ta kowane mataki na cikin ku da tafiyar ku na zama uwa.";
            case "IGBO" -> "MamaCare bụ onye mmekọ gị tụkwasịrị obi site na usoro ọ bụla nke afọ ime gị na njem nne gị.";
            case "YORUBA" -> "MamaCare jẹ alabaṣepọ ti o gbẹkẹle ni oyun ati irin-ajo iya rẹ.";
            case "PIDGIN" -> "MamaCare na your correct friend follow you for every step of your pregnancy and waka as mama.";
            default -> "MamaCare is your trusted companion through every step of your pregnancy and motherhood journey.";
        };
    }
}
