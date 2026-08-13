CREATE TABLE `placeVerificationRecords` (
	`placeId` varchar(128) NOT NULL,
	`status` enum('draft','verified','needs-review') NOT NULL DEFAULT 'draft',
	`sourceUrl` text,
	`verifiedAt` timestamp,
	`internalNote` varchar(500),
	`updatedBy` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `placeVerificationRecords_placeId` PRIMARY KEY(`placeId`)
);
--> statement-breakpoint
ALTER TABLE `placeVerificationRecords` ADD CONSTRAINT `placeVerificationRecords_updatedBy_users_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;