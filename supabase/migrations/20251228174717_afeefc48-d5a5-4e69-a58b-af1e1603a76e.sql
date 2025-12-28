-- Create function to increment coupon usage count
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_code_param TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = COALESCE(used_count, 0) + 1
  WHERE code = coupon_code_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;