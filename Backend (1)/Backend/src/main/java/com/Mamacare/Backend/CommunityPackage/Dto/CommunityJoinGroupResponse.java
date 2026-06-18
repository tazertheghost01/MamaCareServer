package com.Mamacare.Backend.CommunityPackage.Dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CommunityJoinGroupResponse(
    boolean joined,

    @JsonProperty("member_count")
    long memberCount,

    @JsonProperty("member_count_label")
    String memberCountLabel
) {}
