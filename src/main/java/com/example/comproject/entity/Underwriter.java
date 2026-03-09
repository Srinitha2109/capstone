package com.example.comproject.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "underwriters")
public class Underwriter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(unique = true)
    private String employeeCode;

    @Enumerated(EnumType.STRING)
    private Specialization specialization;

    private BigDecimal maxApprovalLimit;

    public enum Specialization {
         LIABILITY, AUTO,  WORKERS_COMP, ALL
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }
    public Specialization getSpecialization() { return specialization; }
    public void setSpecialization(Specialization specialization) { this.specialization = specialization; }
    public BigDecimal getMaxApprovalLimit() { return maxApprovalLimit; }
    public void setMaxApprovalLimit(BigDecimal maxApprovalLimit) { this.maxApprovalLimit = maxApprovalLimit; }
}
