ALTER TABLE daily_goals ADD COLUMN target_value INT NOT NULL DEFAULT 0;
ALTER TABLE daily_goals ADD COLUMN current_progress INT NOT NULL DEFAULT 0;

ALTER TABLE system_daily_goals ADD COLUMN target_value INT NOT NULL DEFAULT 0;
