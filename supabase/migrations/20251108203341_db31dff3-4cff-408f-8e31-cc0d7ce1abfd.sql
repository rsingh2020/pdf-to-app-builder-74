-- Add APR, due date, and rewards type fields to cards table
ALTER TABLE public.cards 
ADD COLUMN apr numeric DEFAULT 0.00,
ADD COLUMN due_date date,
ADD COLUMN rewards_type text DEFAULT 'cashback';