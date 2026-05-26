package com.Mamacare.Backend.AuthenticationPackage;

import com.Mamacare.Backend.AuthenticationPackage.auth.AuthenticationService;
import com.Mamacare.Backend.AuthenticationPackage.auth.RegisterRequestDto;
import com.Mamacare.Backend.AuthenticationPackage.user.Role;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import static com.Mamacare.Backend.AuthenticationPackage.user.Role.ADMIN;
import static com.Mamacare.Backend.AuthenticationPackage.user.Role.MANAGER;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class SecurityApplication {

	public static void main(String[] args) {
		SpringApplication.run(SecurityApplication.class, args);
	}

	@Bean
	public CommandLineRunner commandLineRunner(
			AuthenticationService service
	) {
		return args -> {
			var admin = RegisterRequestDto.builder()
					.fullname("Admin Admin")
					.email("admin@mail.com")
					.password("password")
					.role(ADMIN)
					.build();
			System.out.println("Admin token: " + service.register(admin).getAccessToken());

			var manager = RegisterRequestDto.builder()
					.fullname("Manager Manager")
					.email("manager@mail.com")
					.password("password")
					.role(MANAGER)
					.build();
			System.out.println("Manager token: " + service.register(manager).getAccessToken());

		};
	}
}
