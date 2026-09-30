DROP INDEX "rfps_status_idx";--> statement-breakpoint
DROP INDEX "inquiries_resolved_idx";--> statement-breakpoint
CREATE INDEX "equipment_category_avail_idx" ON "equipment" USING btree ("category","is_available");--> statement-breakpoint
CREATE INDEX "projects_category_idx" ON "projects" USING btree ("category","is_featured");--> statement-breakpoint
CREATE INDEX "rfps_status_idx" ON "enterprise_rfps" USING btree ("status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "inquiries_resolved_idx" ON "inquiries" USING btree ("created_at") WHERE "inquiries"."is_resolved" = false;