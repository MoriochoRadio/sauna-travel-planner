ALTER TABLE `tripPlans` ADD `adminStatus` enum('active','review','archived') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `tripPlans` ADD `adminStatus` enum('active','review','archived') NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `tripPlans` ADD `adminNote` varchar(500);--> statement-breakpoint
ALTER TABLE `tripPlans` ADD `adminUpdatedBy` int;--> statement-breakpoint
ALTER TABLE `tripPlans` ADD `adminUpdatedAt` timestamp;
