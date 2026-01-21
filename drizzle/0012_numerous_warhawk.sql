CREATE INDEX "idx_account_user" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_apartments_resident" ON "apartments" USING btree ("resident_id");--> statement-breakpoint
CREATE INDEX "idx_extra_payments_apartment" ON "extraordinary_payments" USING btree ("apartment_id");--> statement-breakpoint
CREATE INDEX "idx_extra_projects_building" ON "extraordinary_projects" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "idx_extra_projects_status" ON "extraordinary_projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_manager_buildings_manager" ON "manager_buildings" USING btree ("manager_id");--> statement-breakpoint
CREATE INDEX "idx_manager_buildings_building" ON "manager_buildings" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "idx_session_user" ON "session" USING btree ("user_id");