-- Make expiry_date and production_date optional (nullable)
-- These fields should not be required if user doesn't provide them

ALTER TABLE "public"."order_details" 
ALTER COLUMN "expiry_date" DROP NOT NULL;

ALTER TABLE "public"."order_details" 
ALTER COLUMN "production_date" DROP NOT NULL;
