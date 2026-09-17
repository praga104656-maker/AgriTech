CREATE DATABASE IF NOT EXISTS agritech_db;
USE agritech_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    location VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('FARMER', 'BUYER') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email)
);

CREATE TABLE IF NOT EXISTS produce (
    id BIGINT NOT NULL AUTO_INCREMENT,
    farmer_id BIGINT NOT NULL,
    crop_name VARCHAR(255) NOT NULL,
    quantity DOUBLE NOT NULL,
    unit VARCHAR(50) NOT NULL,
    quality_grade VARCHAR(100) NOT NULL,
    expected_price DECIMAL(10,2) NOT NULL,
    harvest_date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_produce_farmer FOREIGN KEY (farmer_id) REFERENCES users(id)
);
