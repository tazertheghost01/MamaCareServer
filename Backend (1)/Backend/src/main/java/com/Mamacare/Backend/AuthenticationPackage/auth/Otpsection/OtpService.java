package com.Mamacare.Backend.AuthenticationPackage.auth.Otpsection;

import com.Mamacare.Backend.AuthenticationPackage.auth.RegisterRequestDto;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private record PendingEntry(
        RegisterRequestDto request,
        String otp,
        LocalDateTime expiresAt) {
    }

    private final Map<String, PendingEntry> store = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public String storePending(RegisterRequestDto request) {
        String otp = String.format("%06d", random.nextInt(1_000_000));
        store.put(
                request.getEmail().toLowerCase(),
                new PendingEntry(request, otp, LocalDateTime.now().plusMinutes(10)));
        return otp;
    }

    public Optional<RegisterRequestDto> verify(String email, String otp) {
        PendingEntry entry = store.get(email.toLowerCase());
        if (entry == null)
            return Optional.empty();
        if (LocalDateTime.now().isAfter(entry.expiresAt())) {
            store.remove(email.toLowerCase());
            return Optional.empty();
        }
        if (!entry.otp().equals(otp))
            return Optional.empty();
        store.remove(email.toLowerCase());
        return Optional.of(entry.request());
    }
}