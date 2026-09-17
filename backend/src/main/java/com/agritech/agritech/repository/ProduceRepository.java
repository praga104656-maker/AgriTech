package com.agritech.agritech.repository;

import com.agritech.agritech.entity.Produce;
import com.agritech.agritech.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduceRepository extends JpaRepository<Produce, Long> {
    List<Produce> findByFarmer(User farmer);
}
