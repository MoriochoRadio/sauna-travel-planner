CREATE TABLE `tripPlanChecklistItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`label` varchar(180) NOT NULL,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`position` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tripPlanChecklistItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tripPlanStops` ADD `startTime` varchar(5);--> statement-breakpoint
ALTER TABLE `tripPlanStops` ADD `estimatedCost` int;--> statement-breakpoint
ALTER TABLE `tripPlanStops` ADD `durationMinutes` int;--> statement-breakpoint
ALTER TABLE `tripPlans` ADD `scheduledFor` timestamp;--> statement-breakpoint
ALTER TABLE `tripPlans` ADD `budgetLimit` int;--> statement-breakpoint
ALTER TABLE `tripPlans` ADD `shareToken` varchar(32);--> statement-breakpoint
ALTER TABLE `tripPlans` ADD `isShared` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `tripPlans` ADD CONSTRAINT `tripPlans_shareToken_unique` UNIQUE(`shareToken`);--> statement-breakpoint
ALTER TABLE `tripPlanChecklistItems` ADD CONSTRAINT `tripPlanChecklistItems_planId_tripPlans_id_fk` FOREIGN KEY (`planId`) REFERENCES `tripPlans`(`id`) ON DELETE cascade ON UPDATE no action;