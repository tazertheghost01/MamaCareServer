package com.Mamacare.Backend.AdminPackage.Settings.Repo;

import com.Mamacare.Backend.AdminPackage.Settings.Entity.AdminSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminSettingRepository extends JpaRepository<AdminSetting, Long> {

    Optional<AdminSetting> findByKey(String key);
}
