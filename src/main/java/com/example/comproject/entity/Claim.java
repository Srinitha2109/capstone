package com.example.comproject.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "claims")
public class Claim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String claimNumber;

    @ManyToOne
    @JoinColumn(name = "policy_application_id")
    private PolicyApplication policyApplication;

    @Column(columnDefinition = "TEXT")
    private String description;

    private BigDecimal claimAmount;

    @Enumerated(EnumType.STRING)
    private ClaimStatus status;

    @ManyToOne
    @JoinColumn(name = "claim_officer_id")
    private ClaimOfficer claimOfficer;

    public enum ClaimStatus {
        SUBMITTED, ASSIGNED, UNDER_INVESTIGATION, APPROVED, PARTIALLY_APPROVED, REJECTED, SETTLED
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getClaimNumber() { return claimNumber; }
    public void setClaimNumber(String claimNumber) { this.claimNumber = claimNumber; }
    public PolicyApplication getPolicyApplication() { return policyApplication; }
    public void setPolicyApplication(PolicyApplication policyApplication) { this.policyApplication = policyApplication; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getClaimAmount() { return claimAmount; }
    public void setClaimAmount(BigDecimal claimAmount) { this.claimAmount = claimAmount; }
    public ClaimStatus getStatus() { return status; }
    public void setStatus(ClaimStatus status) { this.status = status; }
    public ClaimOfficer getClaimOfficer() { return claimOfficer; }
    public void setClaimOfficer(ClaimOfficer claimOfficer) { this.claimOfficer = claimOfficer; }
}
