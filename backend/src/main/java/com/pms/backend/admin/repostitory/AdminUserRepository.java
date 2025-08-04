package com.pms.backend.admin.repostitory;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pms.backend.admin.entity.AdminUser;

@Repository
public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {

    Optional<AdminUser> findByEmail(String email);
}
