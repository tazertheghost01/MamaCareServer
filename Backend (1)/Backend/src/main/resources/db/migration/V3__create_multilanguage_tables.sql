CREATE TABLE learn_cards (
    id VARCHAR(100) NOT NULL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    duration_seconds INT NOT NULL DEFAULT 75,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE learn_card_translations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    card_id VARCHAR(100) NOT NULL,
    language VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    audio_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_learn_card_translations_card FOREIGN KEY (card_id) REFERENCES learn_cards(id) ON DELETE CASCADE,
    UNIQUE KEY uq_card_language (card_id, language)
);

CREATE TABLE pregnancy_weekly_audios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    week_number INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE pregnancy_weekly_audio_translations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    weekly_audio_id BIGINT NOT NULL,
    language VARCHAR(50) NOT NULL,
    title VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    audio_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_weekly_audio_trans FOREIGN KEY (weekly_audio_id) REFERENCES pregnancy_weekly_audios(id) ON DELETE CASCADE,
    UNIQUE KEY uq_weekly_audio_lang (weekly_audio_id, language)
);
