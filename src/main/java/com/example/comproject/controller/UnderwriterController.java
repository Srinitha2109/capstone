package com.example.comproject.controller;

import com.example.comproject.dto.PolicyApplicationDTO;
import com.example.comproject.dto.UnderwriterDTO;
import com.example.comproject.service.PolicyApplicationService;
import com.example.comproject.service.UnderwriterService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/underwriter")
public class UnderwriterController {
    private final PolicyApplicationService policyApplicationService;
    private final UnderwriterService underwriterService;

    public UnderwriterController(PolicyApplicationService policyApplicationService,
                                UnderwriterService underwriterService) {
        this.policyApplicationService = policyApplicationService;
        this.underwriterService = underwriterService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<UnderwriterDTO> createUnderwriter(@RequestBody UnderwriterDTO dto) {
        return ResponseEntity.ok(underwriterService.createUnderwriter(dto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<UnderwriterDTO>> getAllUnderwriters() {
        return ResponseEntity.ok(underwriterService.getAllUnderwriters());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'UNDERWRITER')")
    @GetMapping("/{id}")
    public ResponseEntity<UnderwriterDTO> getUnderwriterById(@PathVariable Long id) {
        UnderwriterDTO underwriter = underwriterService.getUnderwriterById(id);
        return underwriter != null ? ResponseEntity.ok(underwriter) : ResponseEntity.notFound().build();
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/applications/{id}/assign")
    public ResponseEntity<PolicyApplicationDTO> assignUnderwriter(
            @PathVariable Long id,
            @RequestParam Long underwriterId) {
        return ResponseEntity.ok(policyApplicationService.assignUnderwriter(id, underwriterId));
    }

    @PreAuthorize("hasRole('UNDERWRITER')")
    @PutMapping("/applications/{id}/approve")
    public ResponseEntity<PolicyApplicationDTO> approveApplication(
            @PathVariable Long id,
            @RequestParam(required = false) LocalDate startDate) {
        
        PolicyApplicationDTO application = policyApplicationService.getApplicationById(id);
        if (application == null) {
            return ResponseEntity.notFound().build();
        }

        // Set start date (default to today if not provided)
        LocalDate effectiveStartDate = startDate != null ? startDate : LocalDate.now();
        application.setStartDate(effectiveStartDate);
        
        // Calculate end date based on policy duration
        // Assuming 12 months duration - you can fetch from policy
        application.setEndDate(effectiveStartDate.plusMonths(12));
        
        // Update status to APPROVED
        application.setStatus(com.example.comproject.entity.PolicyApplication.ApplicationStatus.APPROVED);
        
        return ResponseEntity.ok(policyApplicationService.updateApplication(id, application));
    }

    @PreAuthorize("hasRole('UNDERWRITER')")
    @PutMapping("/applications/{id}/reject")
    public ResponseEntity<PolicyApplicationDTO> rejectApplication(
            @PathVariable Long id,
            @RequestBody String rejectionReason) {
        
        PolicyApplicationDTO application = policyApplicationService.getApplicationById(id);
        if (application == null) {
            return ResponseEntity.notFound().build();
        }

        application.setStatus(com.example.comproject.entity.PolicyApplication.ApplicationStatus.REJECTED);
        application.setRejectionReason(rejectionReason);
        
        return ResponseEntity.ok(policyApplicationService.updateApplication(id, application));
    }

    @PreAuthorize("hasRole('UNDERWRITER')")
    @PutMapping("/applications/{id}/review")
    public ResponseEntity<PolicyApplicationDTO> markUnderReview(@PathVariable Long id) {
        PolicyApplicationDTO application = policyApplicationService.getApplicationById(id);
        if (application == null) {
            return ResponseEntity.notFound().build();
        }

        application.setStatus(com.example.comproject.entity.PolicyApplication.ApplicationStatus.UNDER_REVIEW);
        
        return ResponseEntity.ok(policyApplicationService.updateApplication(id, application));
    }
}
