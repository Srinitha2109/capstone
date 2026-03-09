package com.example.comproject.dto;

import com.example.comproject.entity.Claim;
import java.math.BigDecimal;

public class ClaimDTO {
    private Long id;
    private String claimNumber;
    private Long policyApplicationId;
    private String description;
    private BigDecimal claimAmount;
    private Claim.ClaimStatus status;
    private Long claimOfficerId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getClaimNumber() { return claimNumber; }
    public void setClaimNumber(String claimNumber) { this.claimNumber = claimNumber; }
    public Long getPolicyApplicationId() { return policyApplicationId; }
    public void setPolicyApplicationId(Long policyApplicationId) { this.policyApplicationId = policyApplicationId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getClaimAmount() { return claimAmount; }
    public void setClaimAmount(BigDecimal claimAmount) { this.claimAmount = claimAmount; }
    public Claim.ClaimStatus getStatus() { return status; }
    public void setStatus(Claim.ClaimStatus status) { this.status = status; }
    public Long getClaimOfficerId() { return claimOfficerId; }
    public void setClaimOfficerId(Long claimOfficerId) { this.claimOfficerId = claimOfficerId; }
}
