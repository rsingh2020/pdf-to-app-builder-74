-- Remove the UPDATE policy that allows users to self-verify
DROP POLICY IF EXISTS "Users can update own verification status" ON public.verification_status;

-- Create a secure function to update verification status
-- This function will be called by edge functions after proper verification
CREATE OR REPLACE FUNCTION public.update_verification_status(
  p_user_id UUID,
  p_ssn_verified BOOLEAN DEFAULT NULL,
  p_id_verified BOOLEAN DEFAULT NULL,
  p_verification_level TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only update fields that are provided (not NULL)
  UPDATE public.verification_status
  SET 
    ssn_verified = COALESCE(p_ssn_verified, ssn_verified),
    id_verified = COALESCE(p_id_verified, id_verified),
    verification_level = COALESCE(p_verification_level, verification_level),
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_verification_status TO authenticated;