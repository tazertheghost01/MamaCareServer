package com.Mamacare.Backend.CommunityPackage.Config;

import com.Mamacare.Backend.CommunityPackage.Entity.CommunityEvent;
import com.Mamacare.Backend.CommunityPackage.Entity.CommunityGroup;
import com.Mamacare.Backend.CommunityPackage.Enums.CommunityEventStatus;
import com.Mamacare.Backend.CommunityPackage.Repo.CommunityEventRepository;
import com.Mamacare.Backend.CommunityPackage.Repo.CommunityGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "community.seed", name = "enabled", havingValue = "true", matchIfMissing = true)
public class CommunitySeedData implements ApplicationRunner {

  private final CommunityGroupRepository groupRepository;
  private final CommunityEventRepository eventRepository;

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    seedGroup(
        "first-time-moms",
        "First Time Moms",
        "Support for first pregnancy questions.",
        10
    );
    seedGroup(
        "second-trimester-mamas",
        "2nd Trimester Mamas",
        "Talk with mamas in the second trimester.",
        20
    );
    seedGroup(
        "new-moms",
        "New Moms",
        "Support after delivery and newborn care.",
        30
    );

    seedEvent(
        "Preparing for a Safe Delivery",
        "Live community session with practical birth-preparation tips."
    );
  }

  private void seedGroup(String slug, String name, String description, int sortOrder) {
    if (groupRepository.existsBySlug(slug)) {
      return;
    }

    groupRepository.save(CommunityGroup.builder()
        .slug(slug)
        .name(name)
        .description(description)
        .sortOrder(sortOrder)
        .active(true)
        .build());
  }

  private void seedEvent(String title, String description) {
    if (eventRepository.existsByTitle(title)) {
      return;
    }

    eventRepository.save(CommunityEvent.builder()
        .title(title)
        .description(description)
        .status(CommunityEventStatus.UPCOMING)
        .startsAt(Instant.now().plus(Duration.ofDays(7)))
        .active(true)
        .build());
  }
}
