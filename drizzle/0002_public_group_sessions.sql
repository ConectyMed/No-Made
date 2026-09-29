ALTER TABLE `outings` ADD `is_public` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `outings` ADD `capacity` integer;--> statement-breakpoint
ALTER TABLE `outings` ADD `public_area` text;