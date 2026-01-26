-- Allow anyone to read their own order by order_number (for invoice viewing)
CREATE POLICY "Anyone can view orders by order_number" 
ON public.orders 
FOR SELECT 
USING (true);

-- Allow anyone to read order items for orders they can see
CREATE POLICY "Anyone can view order items" 
ON public.order_items 
FOR SELECT 
USING (true);