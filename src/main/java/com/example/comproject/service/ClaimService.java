package com.example.comproject.service;

import com.example.comproject.dto.ClaimDTO;
import com.example.comproject.entity.Claim;
import com.example.comproject.exception.InvalidOperationException;
import com.example.comproject.exception.ResourceNotFoundException;
import com.example.comproject.repository.ClaimOfficerRepository;
import com.example.comproject.repository.ClaimRepository;
import com.example.comproject.repository.PolicyApplicationRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClaimService {
    private final ClaimRepository claimRepository;
    private final PolicyApplicationRepository policyApplicationRepository;
    private final ClaimOfficerRepository claimOfficerRepository;

    public ClaimService(ClaimRepository claimRepository,
                       PolicyApplicationRepository policyApplicationRepository,
                       ClaimOfficerRepository claimOfficerRepository) {
        this.claimRepository = claimRepository;
        this.policyApplicationRepository = policyApplicationRepository;
        this.claimOfficerRepository = claimOfficerRepository;
    }

    public ClaimDTO createClaim(ClaimDTO dto) {
        Claim claim = new Claim();
        claim.setClaimNumber(generateClaimNumber());
        claim.setPolicyApplication(policyApplicationRepository.findById(dto.getPolicyApplicationId()).orElseThrow());
        claim.setDescription(dto.getDescription());
        claim.setClaimAmount(dto.getClaimAmount());
        claim.setStatus(Claim.ClaimStatus.SUBMITTED);
        return toDTO(claimRepository.save(claim));
    }

    public ClaimDTO assignClaimOfficer(Long claimId, Long claimOfficerId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));
        
        if (claim.getStatus() != Claim.ClaimStatus.SUBMITTED) {
            throw new InvalidOperationException("Can only assign officer to SUBMITTED claims");
        }

        claim.setClaimOfficer(claimOfficerRepository.findById(claimOfficerId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim officer not found")));
        claim.setStatus(Claim.ClaimStatus.ASSIGNED);
        
        return toDTO(claimRepository.save(claim));
    }

    public ClaimDTO approveClaim(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));
        
        if (claim.getClaimOfficer() == null) {
            throw new InvalidOperationException("Claim officer must be assigned");
        }

        claim.setStatus(Claim.ClaimStatus.APPROVED);
        return toDTO(claimRepository.save(claim));
    }

    public ClaimDTO rejectClaim(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));
        
        if (claim.getClaimOfficer() == null) {
            throw new InvalidOperationException("Claim officer must be assigned");
        }

        claim.setStatus(Claim.ClaimStatus.REJECTED);
        return toDTO(claimRepository.save(claim));
    }

    private String generateClaimNumber() {
        long count = claimRepository.count() + 1;
        return String.format("CLM-%04d", count);
    }

    public ClaimDTO getClaimById(Long id) {
        return claimRepository.findById(id).map(this::toDTO).orElse(null);
    }

    public List<ClaimDTO> getClaimsByPolicyApplication(Long policyApplicationId) {
        return claimRepository.findByPolicyApplicationId(policyApplicationId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ClaimDTO> getClaimsByClaimOfficer(Long claimOfficerId) {
        return claimRepository.findByClaimOfficerId(claimOfficerId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ClaimDTO updateClaim(Long id, ClaimDTO dto) {
        if (claimRepository.existsById(id)) {
            Claim claim = claimRepository.findById(id).orElseThrow();
            claim.setDescription(dto.getDescription());
            claim.setClaimAmount(dto.getClaimAmount());
            claim.setStatus(dto.getStatus());
            if (dto.getClaimOfficerId() != null) {
                claim.setClaimOfficer(claimOfficerRepository.findById(dto.getClaimOfficerId()).orElse(null));
            }
            return toDTO(claimRepository.save(claim));
        }
        return null;
    }

    private ClaimDTO toDTO(Claim claim) {
        ClaimDTO dto = new ClaimDTO();
        dto.setId(claim.getId());
        dto.setClaimNumber(claim.getClaimNumber());
        dto.setPolicyApplicationId(claim.getPolicyApplication().getId());
        dto.setDescription(claim.getDescription());
        dto.setClaimAmount(claim.getClaimAmount());
        dto.setStatus(claim.getStatus());
        if (claim.getClaimOfficer() != null) dto.setClaimOfficerId(claim.getClaimOfficer().getId());
        return dto;
    }
}
