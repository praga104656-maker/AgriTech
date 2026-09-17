package com.agritech.agritech.dto;

import com.agritech.agritech.entity.Produce;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ProduceResponse {
    private Long id;
    private Long farmerId;
    private String cropName;
    private Double quantity;
    private String unit;
    private String qualityGrade;
    private BigDecimal expectedPrice;
    private LocalDate harvestDate;
    private String location;
    private LocalDateTime createdAt;
    private String analysisStatus;

    public ProduceResponse(Produce produce) {
        this.id = produce.getId();
        this.farmerId = produce.getFarmer().getId();
        this.cropName = produce.getCropName();
        this.quantity = produce.getQuantity();
        this.unit = produce.getUnit();
        this.qualityGrade = produce.getQualityGrade();
        this.expectedPrice = produce.getExpectedPrice();
        this.harvestDate = produce.getHarvestDate();
        this.location = produce.getLocation();
        this.createdAt = produce.getCreatedAt();
        this.analysisStatus = "READY_FOR_ANALYSIS";
    }

    public Long getId() {
        return id;
    }

    public Long getFarmerId() {
        return farmerId;
    }

    public String getCropName() {
        return cropName;
    }

    public Double getQuantity() {
        return quantity;
    }

    public String getUnit() {
        return unit;
    }

    public String getQualityGrade() {
        return qualityGrade;
    }

    public BigDecimal getExpectedPrice() {
        return expectedPrice;
    }

    public LocalDate getHarvestDate() {
        return harvestDate;
    }

    public String getLocation() {
        return location;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getAnalysisStatus() {
        return analysisStatus;
    }
}
