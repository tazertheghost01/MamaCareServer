CREATE TABLE system_daily_goals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pregnancy_day INT NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(30) NOT NULL
);

CREATE INDEX idx_system_daily_goals_day ON system_daily_goals(pregnancy_day);

CREATE TABLE daily_goals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(120) NOT NULL,
    description VARCHAR(500),
    category VARCHAR(30) NOT NULL,
    goal_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at DATETIME,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 100,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_daily_goals_user FOREIGN KEY (user_id) REFERENCES _user(id)
);

CREATE INDEX idx_daily_goals_user_date ON daily_goals(user_id, goal_date);
CREATE INDEX idx_daily_goals_user_active ON daily_goals(user_id, active);
