package com.Mamacare.Backend.CommunityPackage.Dto;

import java.util.List;

public record CommunitySearchResponse(
    List<CommunityHomeResponse.DiscussionCard> discussions,
    List<CommunityHomeResponse.GroupCard> groups
) {}
