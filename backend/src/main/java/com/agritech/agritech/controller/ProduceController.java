package com.agritech.agritech.controller;

import com.agritech.agritech.dto.ProduceRequest;
import com.agritech.agritech.dto.ProduceResponse;
import com.agritech.agritech.service.ProduceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/produce")
public class ProduceController {

    private final ProduceService produceService;

    public ProduceController(ProduceService produceService) {
        this.produceService = produceService;
    }

    @PostMapping
    public ResponseEntity<?> createProduce(
            @Valid @RequestBody ProduceRequest request,
            BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            String message = bindingResult.getFieldError() != null
                    ? bindingResult.getFieldError().getDefaultMessage()
                    : "Validation failed";
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", message));
        }

        return ResponseEntity.status(201).body(produceService.createProduce(request));
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<ProduceResponse>> getFarmerProduce(@PathVariable Long farmerId) {
        return ResponseEntity.ok(produceService.getFarmerProduce(farmerId));
    }
}
