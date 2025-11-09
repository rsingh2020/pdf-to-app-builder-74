-- Create transactions table for spending tracking
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id uuid NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  merchant_name text NOT NULL,
  category text NOT NULL,
  amount numeric NOT NULL,
  transaction_date timestamp with time zone NOT NULL DEFAULT now(),
  rewards_earned numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Create offers table for card deals
CREATE TABLE public.card_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES public.cards(id) ON DELETE CASCADE,
  card_type text,
  merchant_name text,
  category text NOT NULL,
  reward_rate numeric NOT NULL,
  offer_type text NOT NULL, -- 'cashback', 'points', 'miles'
  description text,
  expiry_date date,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Create payment reminders table
CREATE TABLE public.payment_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id uuid NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  reminder_date timestamp with time zone NOT NULL,
  amount numeric NOT NULL,
  is_sent boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for card_offers (public read, admin write)
CREATE POLICY "Anyone can view active offers"
  ON public.card_offers FOR SELECT
  USING (is_active = true);

-- RLS Policies for payment_reminders
CREATE POLICY "Users can view own reminders"
  ON public.payment_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON public.payment_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON public.payment_reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON public.payment_reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_card_id ON public.transactions(card_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_category ON public.transactions(category);
CREATE INDEX idx_card_offers_category ON public.card_offers(category);
CREATE INDEX idx_card_offers_expiry ON public.card_offers(expiry_date);
CREATE INDEX idx_payment_reminders_user ON public.payment_reminders(user_id);
CREATE INDEX idx_payment_reminders_date ON public.payment_reminders(reminder_date);