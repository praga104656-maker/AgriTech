package com.agritech.agritech.service;

import com.agritech.agritech.dto.ProduceRequest;
import com.agritech.agritech.dto.ProduceResponse;
import com.agritech.agritech.entity.Produce;
import com.agritech.agritech.entity.User;
import com.agritech.agritech.entity.UserRole;
import com.agritech.agritech.repository.ProduceRepository;
import com.agritech.agritech.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProduceService {

    private final ProduceRepository produceRepository;
    private final UserRepository userRepository;

    public ProduceService(ProduceRepository produceRepository, UserRepository userRepository) {
        this.produceRepository = produceRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ProduceResponse createProduce(ProduceRequest request) {
        User farmer = userRepository.findById(request.getFarmerId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Farmer not found: " + request.getFarmerId()));

        if (farmer.getRole() != UserRole.FARMER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not registered as a farmer");
        }

        Produce produce = new Produce();
        produce.setFarmer(farmer);
        produce.setCropName(request.getCropName().trim());
        produce.setQuantity(request.getQuantity());
        produce.setUnit(request.getUnit().trim());
        produce.setQualityGrade(request.getQualityGrade().trim());
        produce.setExpectedPrice(request.getExpectedPrice());
        produce.setHarvestDate(request.getHarvestDate());
        produce.setLocation(request.getLocation().trim());

        return new ProduceResponse(produceRepository.save(produce));
    }

    @Transactional(readOnly = true)
    public List<ProduceResponse> getFarmerProduce(Long farmerId) {
        User farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Farmer not found: " + farmerId));

        if (farmer.getRole() != UserRole.FARMER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not registered as a farmer");
        }

        return produceRepository.findByFarmer(farmer).stream()
                .map(ProduceResponse::new)
                .toList();
    }
}
