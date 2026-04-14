
-- Delivery Zones table
CREATE TABLE public.delivery_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_name TEXT NOT NULL,
  fee NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active delivery zones"
  ON public.delivery_zones FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage delivery zones"
  ON public.delivery_zones FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default zones (fee in pesewas)
INSERT INTO public.delivery_zones (zone_name, fee, sort_order) VALUES
  ('Accra (within Ring Road)', 2000, 1),
  ('Greater Accra', 3500, 2),
  ('Tema / Tema Community', 3000, 3),
  ('Kumasi', 5000, 4),
  ('Other Regions', 7000, 5);

-- Blog Posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  category TEXT DEFAULT 'General',
  published BOOLEAN NOT NULL DEFAULT false,
  author_name TEXT DEFAULT 'Tillies Avenue',
  featured_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published blog posts"
  ON public.blog_posts FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can manage blog posts"
  ON public.blog_posts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed some blog posts
INSERT INTO public.blog_posts (title, slug, excerpt, content, category, published) VALUES
  ('How to Treat Dark Spots Effectively', 'how-to-treat-dark-spots', 'Discover proven ingredients like Niacinamide and Tranexamic Acid that target hyperpigmentation for clearer, more even skin.', 'Dark spots, also known as hyperpigmentation, are one of the most common skincare concerns. They can be caused by sun exposure, acne scars, hormonal changes, or inflammation. The good news is that with the right ingredients and consistent care, you can significantly reduce their appearance.

**Key Ingredients to Look For:**

1. **Niacinamide (Vitamin B3)** — Reduces melanin transfer to skin cells, fading dark spots over 8-12 weeks of consistent use.

2. **Tranexamic Acid** — A rising star ingredient that inhibits melanin production. Works well for melasma and post-inflammatory hyperpigmentation.

3. **Vitamin C** — A powerful antioxidant that brightens skin and inhibits tyrosinase, the enzyme responsible for melanin production.

4. **Alpha Arbutin** — A gentle alternative to hydroquinone that effectively reduces dark spots without irritation.

**Building Your Routine:**

- Morning: Vitamin C serum → moisturizer → SPF 50
- Evening: Gentle cleanser → Niacinamide serum → Moisturizer with Alpha Arbutin

**Important Tips:**
- Always wear SPF 30+ daily — sun exposure worsens dark spots
- Be patient — most treatments take 6-12 weeks to show results
- Avoid picking at acne — this causes post-inflammatory hyperpigmentation', 'Skincare Tips', true),

  ('Best Skincare Routine for Glowing Skin', 'best-skincare-routine-glowing-skin', 'A step-by-step guide to building the perfect Korean skincare routine, from double cleansing to essences and SPF.', 'Achieving that coveted "glass skin" glow is easier than you think. The Korean skincare routine focuses on layering lightweight, hydrating products to build up moisture and protection.

**The Essential Steps:**

1. **Oil Cleanser** — Removes makeup, SPF, and oil-based impurities
2. **Water-Based Cleanser** — Removes sweat, dirt, and remaining residue
3. **Exfoliant** (2-3x weekly) — AHA/BHA to remove dead skin cells
4. **Toner** — Balances pH and preps skin for absorption
5. **Essence** — The heart of K-beauty; delivers deep hydration
6. **Serum** — Targeted treatment for specific concerns
7. **Moisturizer** — Locks in all previous layers
8. **Sunscreen** (AM only) — Non-negotiable for skin health

**Pro Tips:**
- Apply products from thinnest to thickest consistency
- Pat products in gently — don''t rub
- Wait 30 seconds between layers for absorption
- Your skin barrier is everything — don''t over-exfoliate', 'K-Beauty', true),

  ('The Benefits of Ceramides for Your Skin', 'benefits-of-ceramides', 'Learn why ceramides are essential for a healthy skin barrier and which products deliver the best results.', 'Ceramides make up about 50% of your skin barrier. They are lipid molecules that hold your skin cells together, acting like the "mortar" between the "bricks" of your skin.

**Why Ceramides Matter:**

- Prevent moisture loss (TEWL)
- Protect against environmental damage
- Reduce sensitivity and irritation
- Support skin''s natural repair process

**Signs Your Skin Needs More Ceramides:**
- Dryness and flaking
- Tightness after cleansing
- Redness and sensitivity
- Rough texture

**Best Ceramide Products We Recommend:**
Look for products containing Ceramide NP, Ceramide AP, and Ceramide EOP for the most complete barrier repair.

Apply ceramide-rich moisturizers both morning and night, especially after using active ingredients like retinol or acids.', 'Ingredients', true),

  ('How to Use Salicylic Acid Safely', 'how-to-use-salicylic-acid', 'Everything you need to know about incorporating salicylic acid into your routine without over-exfoliating.', 'Salicylic acid is a beta-hydroxy acid (BHA) that penetrates deep into pores to dissolve excess oil and dead skin cells. It''s the gold standard for acne-prone and oily skin.

**How It Works:**
Unlike AHAs that work on the skin''s surface, salicylic acid is oil-soluble, meaning it can penetrate into clogged pores to clear them from the inside out.

**How to Use It Safely:**

1. **Start Low** — Begin with 0.5-1% concentration
2. **Frequency** — Use 2-3 times per week initially
3. **Build Up** — Gradually increase to daily use if tolerated
4. **Moisturize** — Always follow with a hydrating moisturizer
5. **SPF** — Wear sunscreen daily as BHAs increase sun sensitivity

**Who Should Avoid It:**
- Those with very dry or sensitive skin
- Pregnant or nursing women (consult your doctor)
- Anyone using multiple exfoliating products

**Our Tip:** Layer salicylic acid under a niacinamide serum for the ultimate anti-acne combo!', 'Skincare Tips', true);
