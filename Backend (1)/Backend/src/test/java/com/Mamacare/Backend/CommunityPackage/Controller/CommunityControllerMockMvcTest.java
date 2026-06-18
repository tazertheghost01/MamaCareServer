package com.Mamacare.Backend.CommunityPackage.Controller;

import com.Mamacare.Backend.CommunityPackage.Dto.CommunityHomeResponse;
import com.Mamacare.Backend.CommunityPackage.Dto.CommunityJoinGroupResponse;
import com.Mamacare.Backend.CommunityPackage.Dto.CreateCommunityQuestionRequest;
import com.Mamacare.Backend.CommunityPackage.Services.CommunityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CommunityControllerMockMvcTest {

    private MockMvc mockMvc;

    @Mock
    private CommunityService communityService;

    @Mock
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        CommunityController controller = new CommunityController(communityService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setValidator(validator)
                .build();
    }

    @Test
    void getHomeReturnsCommunityScreenData() throws Exception {
        when(authentication.getName()).thenReturn("mama@example.com");
        when(communityService.getHome("mama@example.com")).thenReturn(homeResponse());

        mockMvc.perform(get("/api/v1/community/home")
                        .principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.screen_title").value("Community"))
                .andExpect(jsonPath("$.hero_message").value("You are not alone, Mama!"))
                .andExpect(jsonPath("$.groups[0].name").value("First Time Moms"))
                .andExpect(jsonPath("$.groups[0].member_count_label").value("8.4K members"))
                .andExpect(jsonPath("$.popular_discussions[0].title").value("What helped you with morning sickness?"))
                .andExpect(jsonPath("$.featured_event.status_label").value("Live"))
                .andExpect(jsonPath("$.footer.title").value("Be kind, be supportive, be you."));

        verify(communityService).getHome("mama@example.com");
    }

    @Test
    void askQuestionReturnsCreatedDiscussion() throws Exception {
        when(authentication.getName()).thenReturn("mama@example.com");
        when(communityService.askQuestion(any(CreateCommunityQuestionRequest.class), any()))
                .thenReturn(new CommunityHomeResponse.DiscussionCard(
                        9L,
                        "Is back pain normal?",
                        "2nd Trimester Mamas",
                        "Amaka T",
                        0,
                        "0",
                        "just now"
                ));

        mockMvc.perform(post("/api/v1/community/questions")
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "group_id": 2,
                                  "title": "Is back pain normal?",
                                  "body": "I am in second trimester."
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(9))
                .andExpect(jsonPath("$.title").value("Is back pain normal?"))
                .andExpect(jsonPath("$.group_name").value("2nd Trimester Mamas"));
    }

    @Test
    void joinGroupReturnsUpdatedMembershipState() throws Exception {
        when(authentication.getName()).thenReturn("mama@example.com");
        when(communityService.joinGroup(1L, "mama@example.com"))
                .thenReturn(new CommunityJoinGroupResponse(true, 8401, "8.4K members"));

        mockMvc.perform(post("/api/v1/community/groups/{groupId}/join", 1L)
                        .principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.joined").value(true))
                .andExpect(jsonPath("$.member_count").value(8401))
                .andExpect(jsonPath("$.member_count_label").value("8.4K members"));
    }

    private CommunityHomeResponse homeResponse() {
        return new CommunityHomeResponse(
                "Community",
                "You are not alone, Mama!",
                "Search questions, topics or moms",
                "Ask a Question",
                List.of("Discussion", "Groups", "Events"),
                List.of(new CommunityHomeResponse.GroupCard(
                        1L,
                        "First Time Moms",
                        "Support for first pregnancy questions.",
                        8400,
                        "8.4K members",
                        false,
                        "Join"
                )),
                List.of(new CommunityHomeResponse.DiscussionCard(
                        9L,
                        "What helped you with morning sickness?",
                        "First Time Moms",
                        "Sarah O",
                        128,
                        "128",
                        "2h ago"
                )),
                new CommunityHomeResponse.EventCard(
                        7L,
                        "Preparing for a Safe Delivery",
                        "LIVE",
                        "Live",
                        Instant.parse("2026-06-18T09:00:00Z"),
                        "Thu Jun 18, 2026 10.00 AM",
                        2100,
                        "2.1K",
                        false,
                        "Register Now"
                ),
                new CommunityHomeResponse.Footer(
                        "Be kind, be supportive, be you.",
                        "This is safe space for every mama."
                )
        );
    }
}
