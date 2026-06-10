package com.Mamacare.Backend.BabyGrowthPackage.Dto;

import java.util.List;

public record BabyGrowthWeekContent(
    String lengthLabel,
    String weightLabel,
    String heartbeatLabel,
    String heroMessage,
    List<String> happenings
) {}