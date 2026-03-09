package com.example.comproject.repository;

import com.example.comproject.entity.Underwriter;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UnderwriterRepository extends JpaRepository<Underwriter, Long> {
    Optional<Underwriter> findByUserId(Long userId);

    boolean existsByUserId(long id);
}
