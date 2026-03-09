package com.example.comproject.dto;

import com.example.comproject.entity.Underwriter;
import java.math.BigDecimal;

public class UnderwriterDTO {
    private Long id;
    private Long userId;
    private String employeeCode;
    private Underwriter.Specialization specialization;
    private BigDecimal maxApprovalLimit;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }
    public Underwriter.Specialization getSpecialization() { return specialization; }
    public void setSpecialization(Underwriter.Specialization specialization) { this.specialization = specialization; }
    public BigDecimal getMaxApprovalLimit() { return maxApprovalLimit; }
    public void setMaxApprovalLimit(BigDecimal maxApprovalLimit) { this.maxApprovalLimit = maxApprovalLimit; }
}
