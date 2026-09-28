CREATE TABLE `auth_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `auth_sessions_user_idx` ON `auth_sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `contacts_email_unique` ON `contacts` (`email`);--> statement-breakpoint
CREATE TABLE `outings` (
	`id` text PRIMARY KEY NOT NULL,
	`offer_slug` text NOT NULL,
	`offer_label` text NOT NULL,
	`starts_at` integer NOT NULL,
	`duration_min` integer,
	`place` text,
	`status` text DEFAULT 'prevue' NOT NULL,
	`amount_cents` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`done_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `outings_starts_idx` ON `outings` (`starts_at`);--> statement-breakpoint
CREATE INDEX `outings_status_idx` ON `outings` (`status`);--> statement-breakpoint
CREATE TABLE `participants` (
	`id` text PRIMARY KEY NOT NULL,
	`outing_id` text NOT NULL,
	`contact_id` text NOT NULL,
	`request_id` text,
	`people` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`outing_id`) REFERENCES `outings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `participants_outing_idx` ON `participants` (`outing_id`);--> statement-breakpoint
CREATE INDEX `participants_contact_idx` ON `participants` (`contact_id`);--> statement-breakpoint
CREATE TABLE `password_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `requests` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_id` text NOT NULL,
	`offer_slug` text NOT NULL,
	`offer_label` text NOT NULL,
	`group_size` integer NOT NULL,
	`preferred_period` text NOT NULL,
	`message` text,
	`status` text DEFAULT 'nouvelle' NOT NULL,
	`notes` text,
	`outing_id` text,
	`replied_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `requests_status_idx` ON `requests` (`status`);--> statement-breakpoint
CREATE INDEX `requests_contact_idx` ON `requests` (`contact_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text,
	`role` text DEFAULT 'admin' NOT NULL,
	`failed_logins` integer DEFAULT 0 NOT NULL,
	`locked_until` integer,
	`last_login_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);