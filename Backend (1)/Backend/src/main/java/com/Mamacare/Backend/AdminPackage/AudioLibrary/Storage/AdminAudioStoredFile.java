package com.Mamacare.Backend.AdminPackage.AudioLibrary.Storage;

public record AdminAudioStoredFile(
        String originalFilename,
        String storedFilename,
        String relativePath,
        String contentType,
        long fileSizeBytes
) {
}
