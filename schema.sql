-- Run this once in DBeaver (connected to TiDB Cloud), like the course's users table.

CREATE TABLE `saved_cities` (
  `id` int(11) PRIMARY KEY AUTO_INCREMENT,
  `device_id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_device` (`device_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `feedback` (
  `id` int(11) PRIMARY KEY AUTO_INCREMENT,
  `device_id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `rating` tinyint NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
