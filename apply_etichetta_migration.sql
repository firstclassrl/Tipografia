-- Apply this SQL in Supabase Dashboard > SQL Editor
-- This adds the fronte_retro and sagomata columns to order_details table

ALTER TABLE "public"."order_details" 
ADD COLUMN "fronte_retro" boolean DEFAULT false;

ALTER TABLE "public"."order_details" 
ADD COLUMN "sagomata" boolean DEFAULT false;
