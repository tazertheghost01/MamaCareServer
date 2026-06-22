package com.Mamacare.Backend.AdminPackage.AudioLibrary.Storage;

import com.Mamacare.Backend.AdminPackage.AudioLibrary.Entity.AdminAudioAsset;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioCategory;
import com.Mamacare.Backend.AdminPackage.AudioLibrary.Enums.AdminAudioLanguage;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class AdminAudioStorageService {

    private static final long MAX_AUDIO_BYTES = 50L * 1024L * 1024L;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "audio/mpeg",
            "audio/mp3",
            "audio/wav",
            "audio/x-wav",
            "audio/aac",
            "audio/mp4",
            "audio/ogg",
            "audio/webm"
    );
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("mp3", "wav", "aac", "m4a", "ogg", "webm");

    private final Path rootLocation = Path.of("uploads", "audio-library").toAbsolutePath().normalize();

    public AdminAudioStoredFile store(
            MultipartFile file,
            AdminAudioLanguage language,
            AdminAudioCategory category
    ) {
        validate(file);

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() == null ? "audio-file" : file.getOriginalFilename()
        );
        String extension = extensionFrom(originalFilename);
        String storedFilename = UUID.randomUUID() + "." + extension;
        Path languageFolder = rootLocation.resolve(language.folderName()).resolve(category.folderName()).normalize();
        Path destination = languageFolder.resolve(storedFilename).normalize().toAbsolutePath();

        if (!destination.startsWith(rootLocation)) {
            throw new IllegalArgumentException("Invalid audio storage path.");
        }

        try {
            Files.createDirectories(languageFolder);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
            }
            String relativePath = rootLocation.relativize(destination).toString().replace("\\", "/");
            return new AdminAudioStoredFile(
                    originalFilename,
                    storedFilename,
                    relativePath,
                    safeContentType(file),
                    file.getSize()
            );
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to store audio file.", exception);
        }
    }

    public Resource loadAsResource(AdminAudioAsset asset) {
        try {
            Path file = rootLocation.resolve(asset.getRelativePath()).normalize().toAbsolutePath();
            if (!file.startsWith(rootLocation)) {
                throw new IllegalArgumentException("Invalid audio file path.");
            }
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new IllegalArgumentException("Audio file is not readable.");
        } catch (MalformedURLException exception) {
            throw new IllegalArgumentException("Audio file URL is invalid.", exception);
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Audio file is required.");
        }
        if (file.getSize() > MAX_AUDIO_BYTES) {
            throw new IllegalArgumentException("Audio file is too large. Maximum allowed size is 50MB.");
        }
        String contentType = safeContentType(file);
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Unsupported audio type: " + contentType);
        }
        String originalFilename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String extension = extensionFrom(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Unsupported audio extension: " + extension);
        }
    }

    private String safeContentType(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType == null ? "application/octet-stream" : contentType.toLowerCase(Locale.ENGLISH);
    }

    private String extensionFrom(String filename) {
        String clean = StringUtils.cleanPath(filename);
        int extensionStart = clean.lastIndexOf('.');
        if (extensionStart < 0 || extensionStart == clean.length() - 1) {
            throw new IllegalArgumentException("Audio filename must include a supported extension.");
        }
        return clean.substring(extensionStart + 1).toLowerCase(Locale.ENGLISH);
    }
}
