package com.Mamacare.Backend.Commons.Storage;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "gcp")
public class GcpStorageService implements StorageService {

    @Value("${storage.gcp.bucket-name:mamacare-audios}")
    private String bucketName;

    @Value("${storage.gcp.credentials-path:}")
    private String credentialsPath;

    private Storage storage;

    @PostConstruct
    public void init() throws IOException {
        if (credentialsPath != null && !credentialsPath.trim().isEmpty()) {
            try (InputStream is = new ClassPathResource(credentialsPath.trim()).getInputStream()) {
                storage = StorageOptions.newBuilder()
                        .setCredentials(GoogleCredentials.fromStream(is))
                        .build()
                        .getService();
            }
        } else {
            // Falls back to Google Application Default Credentials (ADC)
            storage = StorageOptions.getDefaultInstance().getService();
        }
    }

    @Override
    public String uploadFile(MultipartFile file, String folder) {
        try {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("File cannot be empty");
            }

            String originalFileName = file.getOriginalFilename();
            String extension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }

            String fileName = folder + "/" + UUID.randomUUID().toString() + extension;

            BlobInfo blobInfo = BlobInfo.newBuilder(bucketName, fileName)
                    .setContentType(file.getContentType() != null ? file.getContentType() : "audio/mpeg")
                    .build();

            storage.create(blobInfo, file.getBytes());

            return "https://storage.googleapis.com/" + bucketName + "/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Could not upload file to GCP storage", e);
        }
    }
}
