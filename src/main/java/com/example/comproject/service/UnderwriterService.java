package com.example.comproject.service;

import com.example.comproject.dto.UnderwriterDTO;
import com.example.comproject.entity.Underwriter;
import com.example.comproject.repository.UnderwriterRepository;
import com.example.comproject.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UnderwriterService {
    private final UnderwriterRepository underwriterRepository;
    private final UserRepository userRepository;

    public UnderwriterService(UnderwriterRepository underwriterRepository, UserRepository userRepository) {
        this.underwriterRepository = underwriterRepository;
        this.userRepository = userRepository;
    }

    public UnderwriterDTO createUnderwriter(UnderwriterDTO dto) {
        Underwriter underwriter = new Underwriter();
        underwriter.setUser(userRepository.findById(dto.getUserId()).orElseThrow());
        underwriter.setEmployeeCode(generateEmployeeCode());
        underwriter.setSpecialization(dto.getSpecialization());
        underwriter.setMaxApprovalLimit(dto.getMaxApprovalLimit());
        return toDTO(underwriterRepository.save(underwriter));
    }

    private String generateEmployeeCode() {
        long count = underwriterRepository.count() + 1;
        return String.format("UW-%04d", count);
    }

    public UnderwriterDTO getUnderwriterById(Long id) {
        return underwriterRepository.findById(id).map(this::toDTO).orElse(null);
    }

    public List<UnderwriterDTO> getAllUnderwriters() {
        return underwriterRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    private UnderwriterDTO toDTO(Underwriter underwriter) {
        UnderwriterDTO dto = new UnderwriterDTO();
        dto.setId(underwriter.getId());
        if (underwriter.getUser() != null) {
            dto.setUserId(underwriter.getUser().getId());
        }
        dto.setEmployeeCode(underwriter.getEmployeeCode());
        dto.setSpecialization(underwriter.getSpecialization());
        dto.setMaxApprovalLimit(underwriter.getMaxApprovalLimit());
        return dto;
    }
}
