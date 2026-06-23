package com.Mamacare.Backend.AuthenticationPackage.auth;

import com.Mamacare.Backend.AuthenticationPackage.user.Role;
import com.Mamacare.Backend.AuthenticationPackage.user.User;
import com.Mamacare.Backend.AuthenticationPackage.user.UserRepository;
import com.Mamacare.Backend.AuthenticationPackage.token.Token;
import com.Mamacare.Backend.AuthenticationPackage.token.TokenRepository;
import com.Mamacare.Backend.AuthenticationPackage.token.TokenType;
import com.Mamacare.Backend.AuthenticationPackage.config.JwtService;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.UrlJwkProvider;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.URL;
import java.security.interfaces.RSAPublicKey;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class OAuth2Service {

    private final UserRepository repository;
    private final TokenRepository tokenRepository;
    private final JwtService jwtService;

    @Value("${spring.security.oauth2.client.registration.google.client-id:[YOUR_GOOGLE_CLIENT_ID]}")
    private String googleClientId;

    public AuthenticationResponse authenticateWithOAuth2(OAuth2LoginRequest request) {
        String email = null;
        String fullname = null;

        try {
            if ("google".equalsIgnoreCase(request.getProvider())) {
                GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                        .setAudience(Collections.singletonList(googleClientId))
                        .build();

                GoogleIdToken idToken = verifier.verify(request.getIdToken());
                if (idToken != null) {
                    GoogleIdToken.Payload payload = idToken.getPayload();
                    email = payload.getEmail();
                    fullname = (String) payload.get("name");
                } else {
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google ID token.");
                }
            } else if ("apple".equalsIgnoreCase(request.getProvider())) {
                DecodedJWT jwt = JWT.decode(request.getIdToken());
                JwkProvider provider = new UrlJwkProvider(new URL("https://appleid.apple.com/auth/keys"));
                Jwk jwk = provider.get(jwt.getKeyId());
                Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);
                algorithm.verify(jwt);
                
                email = jwt.getClaim("email").asString();
                // Apple only sends name on the FIRST login, so we use request fields if available
                if (request.getFirstName() != null) {
                    fullname = request.getFirstName() + (request.getLastName() != null ? " " + request.getLastName() : "");
                }
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported provider.");
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Failed to verify OAuth2 token: " + e.getMessage());
        }

        if (email == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email not found in OAuth2 token.");
        }

        // Find or create user
        var user = repository.findByEmail(email).orElse(null);
        if (user == null) {
            user = User.builder()
                    .fullname(fullname != null ? fullname : "User")
                    .email(email.toLowerCase())
                    .password("") // OAuth2 users don't have a password
                    .role(Role.USER)
                    .enabled(true)
                    .build();
            user = repository.save(user);
        }

        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, jwtToken);

        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }

    private void saveUserToken(User user, String jwtToken) {
        var token = Token.builder()
                .user(user)
                .token(jwtToken)
                .tokenType(TokenType.BEARER)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(token);
    }

    private void revokeAllUserTokens(User user) {
        var validUserTokens = tokenRepository.findAllValidTokenByUser(user.getId());
        if (validUserTokens.isEmpty()) return;
        validUserTokens.forEach(token -> {
            token.setExpired(true);
            token.setRevoked(true);
        });
        tokenRepository.saveAll(validUserTokens);
    }
}
