-- Categories
INSERT INTO public.categories (name, slug, icon, sort_order) VALUES
('Skin Care', 'skin-care', 'Sparkles', 1),
('Hair Care', 'hair-care', 'Zap', 2),
('Body Care', 'body-care', 'Activity', 3);

-- Products
INSERT INTO public.products (name, brand, description, price, category_slug, image_url, in_stock, rating, reviews_count) VALUES
('Radiance Face Serum', 'Glow Essence', 'A powerful vitamin C serum for a brighter, more radiant complexion.', 120.00, 'skin-care', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400', true, 4.8, 24),
('Hydrating Rose Water', 'Nature Pure', 'Organic rose water toner that refreshes and hydrates all skin types.', 85.00, 'skin-care', 'https://images.unsplash.com/photo-1601049541289-9b1b7abcfe19?auto=format&fit=crop&q=80&w=400', true, 4.5, 15),
('Moisturizing Shea Butter', 'Ghana Gold', '100% pure organic shea butter for deep skin nourishment.', 45.00, 'body-care', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=400', true, 4.9, 42),
('Argan Oil Hair Mask', 'Silk Smooth', 'Deep conditioning mask for split ends and damaged hair.', 95.00, 'hair-care', 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=400', true, 4.7, 18);
