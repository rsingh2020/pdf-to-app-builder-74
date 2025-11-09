-- Add optional card image URL field to store actual credit card images
ALTER TABLE public.cards 
ADD COLUMN card_image_url text;