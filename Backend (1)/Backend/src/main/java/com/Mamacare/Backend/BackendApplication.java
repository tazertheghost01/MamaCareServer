package com.Mamacare.Backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class BackendApplication {

	public static void main(String[] args) {
    Dotenv dotenv = Dotenv.configure()
            .ignoreIfMissing()
            .load();

    // Helper: set system property only if the env var is not null
    setIfNotNull("GCP_DB_USER", dotenv.get("GCP_DB_USER"));
    setIfNotNull("GCP_DB_PASSWORD", dotenv.get("GCP_DB_PASSWORD"));
    setIfNotNull("JWT_SECRET", dotenv.get("JWT_SECRET"));

    // Optionally set all entries, but skip nulls
    dotenv.entries().forEach(entry -> {
        if (entry.getValue() != null) {
            System.setProperty(entry.getKey(), entry.getValue());
        }
    });

    SpringApplication.run(BackendApplication.class, args);
}

private static void setIfNotNull(String key, String value) {
    if (value != null) {
        System.setProperty(key, value);
    }
}

}