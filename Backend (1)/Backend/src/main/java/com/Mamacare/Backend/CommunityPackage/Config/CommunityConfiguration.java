package com.Mamacare.Backend.CommunityPackage.Config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(CommunityCopyProperties.class)
public class CommunityConfiguration {
}
