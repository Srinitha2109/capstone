package com.example.comproject.repository;

import com.example.comproject.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByPolicyApplicationId(Long policyApplicationId);
    
    @Query("SELECT p FROM Payment p WHERE p.policyApplication.user.id = :userId ORDER BY p.paymentDate DESC")
    List<Payment> findByUserId(@Param("userId") Long userId);
}
