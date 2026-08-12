CREATE TABLE `favoritePlaces` (
	`userId` int NOT NULL,
	`placeId` varchar(128) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favoritePlaces_userId_placeId_pk` PRIMARY KEY(`userId`,`placeId`)
);
--> statement-breakpoint
CREATE TABLE `places` (
	`id` varchar(128) NOT NULL,
	`name` varchar(160) NOT NULL,
	`category` enum('sauna','jjimjilbang','hot-spring') NOT NULL,
	`region` varchar(80) NOT NULL,
	`city` varchar(80) NOT NULL,
	`address` text,
	`summary` text NOT NULL,
	`sourceUrl` text,
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `places_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommendationHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`region` varchar(80) NOT NULL,
	`preference` json NOT NULL,
	`itinerary` json NOT NULL,
	`source` enum('ai','curated') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recommendationHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tripPlanStops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`placeId` varchar(128) NOT NULL,
	`position` int NOT NULL,
	`note` varchar(240),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tripPlanStops_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tripPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(120) NOT NULL,
	`region` varchar(80) NOT NULL,
	`coverPlaceId` varchar(128),
	`isArchived` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tripPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `visitRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`placeId` varchar(128) NOT NULL,
	`note` varchar(240),
	`visitedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `visitRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `favoritePlaces` ADD CONSTRAINT `favoritePlaces_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recommendationHistory` ADD CONSTRAINT `recommendationHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tripPlanStops` ADD CONSTRAINT `tripPlanStops_planId_tripPlans_id_fk` FOREIGN KEY (`planId`) REFERENCES `tripPlans`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tripPlans` ADD CONSTRAINT `tripPlans_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `visitRecords` ADD CONSTRAINT `visitRecords_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;