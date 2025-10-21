-- Add fronte_retro and sagomata fields to order_details table
ALTER TABLE order_details 
ADD COLUMN fronte_retro BOOLEAN DEFAULT FALSE,
ADD COLUMN sagomata BOOLEAN DEFAULT FALSE;
