-- Add columns for credit limits, annual fees, cashback, and pending dues to cards table
ALTER TABLE public.cards 
ADD COLUMN credit_limit numeric DEFAULT 10000.00,
ADD COLUMN annual_fee numeric DEFAULT 0.00,
ADD COLUMN cashback numeric DEFAULT 0.00,
ADD COLUMN pending_dues numeric DEFAULT 0.00;