-- Add sender_number column to orders table for mobile banking payment verification
ALTER TABLE public.orders ADD COLUMN sender_number text;