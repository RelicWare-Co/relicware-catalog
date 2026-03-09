CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `invitation` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`inviter_id` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inviter_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `invitation_organizationId_idx` ON `invitation` (`organization_id`);--> statement-breakpoint
CREATE INDEX `invitation_email_idx` ON `invitation` (`email`);--> statement-breakpoint
CREATE TABLE `member` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `member_organizationId_idx` ON `member` (`organization_id`);--> statement-breakpoint
CREATE INDEX `member_userId_idx` ON `member` (`user_id`);--> statement-breakpoint
CREATE TABLE `organization` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`logo` text,
	`created_at` integer NOT NULL,
	`metadata` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organization_slug_unique` ON `organization` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `organization_slug_uidx` ON `organization` (`slug`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`impersonated_by` text,
	`active_organization_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`role` text,
	`banned` integer DEFAULT false,
	`ban_reason` text,
	`ban_expires` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE TABLE `brand_themes` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`preset` text DEFAULT 'custom' NOT NULL,
	`primary_color` text DEFAULT '#1F6FEB' NOT NULL,
	`secondary_color` text,
	`accent_color` text,
	`background_color` text DEFAULT '#FFF8F1' NOT NULL,
	`surface_color` text,
	`text_color` text DEFAULT '#1B1B18' NOT NULL,
	`muted_text_color` text,
	`font_heading` text,
	`font_body` text,
	`border_radius` text DEFAULT 'lg' NOT NULL,
	`button_style` text DEFAULT 'solid' NOT NULL,
	`card_style` text DEFAULT 'elevated' NOT NULL,
	`style_overrides` text,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `brand_themes_organization_id_idx` ON `brand_themes` (`organization_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `brand_themes_org_name_uidx` ON `brand_themes` (`organization_id`,`name`);--> statement-breakpoint
CREATE TABLE `catalog_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`catalog_id` text NOT NULL,
	`parent_category_id` text,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`image_url` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_visible` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`catalog_id`) REFERENCES `catalogs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_category_id`) REFERENCES `catalog_categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `catalog_categories_catalog_id_idx` ON `catalog_categories` (`catalog_id`);--> statement-breakpoint
CREATE INDEX `catalog_categories_parent_id_idx` ON `catalog_categories` (`parent_category_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `catalog_categories_catalog_slug_uidx` ON `catalog_categories` (`catalog_id`,`slug`);--> statement-breakpoint
CREATE TABLE `catalog_item_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`catalog_item_id` text NOT NULL,
	`name` text NOT NULL,
	`sku` text,
	`option_values` text,
	`price_amount` integer,
	`compare_at_price_amount` integer,
	`inventory_quantity` integer,
	`is_default` integer DEFAULT false NOT NULL,
	`is_available` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`catalog_item_id`) REFERENCES `catalog_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `catalog_item_variants_item_id_idx` ON `catalog_item_variants` (`catalog_item_id`);--> statement-breakpoint
CREATE INDEX `catalog_item_variants_sku_idx` ON `catalog_item_variants` (`sku`);--> statement-breakpoint
CREATE UNIQUE INDEX `catalog_item_variants_item_sort_uidx` ON `catalog_item_variants` (`catalog_item_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `catalog_items` (
	`id` text PRIMARY KEY NOT NULL,
	`catalog_id` text NOT NULL,
	`category_id` text,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`sku` text,
	`short_description` text,
	`description` text,
	`image_url` text,
	`gallery` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`base_price_amount` integer,
	`compare_at_price_amount` integer,
	`inventory_quantity` integer,
	`has_variants` integer DEFAULT false NOT NULL,
	`track_inventory` integer DEFAULT false NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`is_available` integer DEFAULT true NOT NULL,
	`tags` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`catalog_id`) REFERENCES `catalogs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `catalog_categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `catalog_items_catalog_id_idx` ON `catalog_items` (`catalog_id`);--> statement-breakpoint
CREATE INDEX `catalog_items_category_id_idx` ON `catalog_items` (`category_id`);--> statement-breakpoint
CREATE INDEX `catalog_items_sku_idx` ON `catalog_items` (`sku`);--> statement-breakpoint
CREATE UNIQUE INDEX `catalog_items_catalog_slug_uidx` ON `catalog_items` (`catalog_id`,`slug`);--> statement-breakpoint
CREATE TABLE `catalogs` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`site_id` text,
	`location_id` text,
	`brand_theme_id` text,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`currency_code` text DEFAULT 'COP' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`price_display_mode` text DEFAULT 'exact' NOT NULL,
	`cover_image_url` text,
	`is_public` integer DEFAULT true NOT NULL,
	`settings` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`brand_theme_id`) REFERENCES `brand_themes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `catalogs_organization_id_idx` ON `catalogs` (`organization_id`);--> statement-breakpoint
CREATE INDEX `catalogs_site_id_idx` ON `catalogs` (`site_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `catalogs_org_slug_uidx` ON `catalogs` (`organization_id`,`slug`);--> statement-breakpoint
CREATE TABLE `lead_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`site_id` text,
	`location_id` text,
	`source` text DEFAULT 'site' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`company_name` text,
	`preferred_contact_method` text,
	`message` text,
	`context` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `lead_requests_organization_id_idx` ON `lead_requests` (`organization_id`);--> statement-breakpoint
CREATE INDEX `lead_requests_site_id_idx` ON `lead_requests` (`site_id`);--> statement-breakpoint
CREATE INDEX `lead_requests_status_idx` ON `lead_requests` (`status`);--> statement-breakpoint
CREATE TABLE `locations` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`address_line_1` text,
	`address_line_2` text,
	`district` text,
	`city` text,
	`state` text,
	`postal_code` text,
	`country_code` text DEFAULT 'MX' NOT NULL,
	`phone` text,
	`whatsapp_phone` text,
	`contact_email` text,
	`map_url` text,
	`business_hours` text,
	`is_primary` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `locations_organization_id_idx` ON `locations` (`organization_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `locations_org_slug_uidx` ON `locations` (`organization_id`,`slug`);--> statement-breakpoint
CREATE TABLE `reservation_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`site_id` text,
	`location_id` text NOT NULL,
	`source` text DEFAULT 'site' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`customer_name` text NOT NULL,
	`customer_email` text,
	`customer_phone` text,
	`party_size` integer DEFAULT 1 NOT NULL,
	`requested_at` integer NOT NULL,
	`notes` text,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reservation_requests_organization_id_idx` ON `reservation_requests` (`organization_id`);--> statement-breakpoint
CREATE INDEX `reservation_requests_location_id_idx` ON `reservation_requests` (`location_id`);--> statement-breakpoint
CREATE INDEX `reservation_requests_requested_at_idx` ON `reservation_requests` (`requested_at`);--> statement-breakpoint
CREATE INDEX `reservation_requests_status_idx` ON `reservation_requests` (`status`);--> statement-breakpoint
CREATE TABLE `site_links` (
	`id` text PRIMARY KEY NOT NULL,
	`site_section_id` text NOT NULL,
	`label` text NOT NULL,
	`url` text NOT NULL,
	`type` text DEFAULT 'custom' NOT NULL,
	`icon` text,
	`thumbnail_url` text,
	`analytics_key` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_highlighted` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`site_section_id`) REFERENCES `site_sections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `site_links_site_section_id_idx` ON `site_links` (`site_section_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `site_links_section_sort_uidx` ON `site_links` (`site_section_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `site_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`site_id` text NOT NULL,
	`type` text DEFAULT 'hero' NOT NULL,
	`title` text,
	`subtitle` text,
	`body` text,
	`content` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_visible` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `site_sections_site_id_idx` ON `site_sections` (`site_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `site_sections_site_sort_uidx` ON `site_sections` (`site_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `sites` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`location_id` text,
	`brand_theme_id` text,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`type` text DEFAULT 'hybrid' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`subdomain` text,
	`custom_domain` text,
	`headline` text,
	`subheadline` text,
	`description` text,
	`logo_url` text,
	`hero_image_url` text,
	`cover_image_url` text,
	`primary_cta_label` text,
	`primary_cta_url` text,
	`seo_title` text,
	`seo_description` text,
	`social_links` text,
	`settings` text,
	`is_public` integer DEFAULT true NOT NULL,
	`published_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`brand_theme_id`) REFERENCES `brand_themes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `sites_organization_id_idx` ON `sites` (`organization_id`);--> statement-breakpoint
CREATE INDEX `sites_location_id_idx` ON `sites` (`location_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `sites_slug_uidx` ON `sites` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `sites_subdomain_uidx` ON `sites` (`subdomain`);--> statement-breakpoint
CREATE UNIQUE INDEX `sites_custom_domain_uidx` ON `sites` (`custom_domain`);