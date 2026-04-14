# ✨ Tillies Avenue Glow

A premium, MoMo-first eCommerce platform for curated beauty and skincare products, specifically optimized for the Ghanaian market.

## 🚀 Overview

Tillies Avenue Glow is a high-performance, aesthetically stunning storefront built with a modern tech stack. It features a seamless shopping experience, real-time inventory management, and a robust admin dashboard.

### Key Features
- **Premium Storefront:** Dynamic, responsive UI with glassmorphism and smooth animations.
- **Admin Dashboard:** Comprehensive management suite for products, orders, categories, and delivery zones.
- **MoMo-First Checkout:** Optimized for MTN MoMo, Telecel Cash, and AirtelTigo Money via aggregator integrations.
- **Transactional Emails:** Integration with **Resend API** for order confirmations, shipping updates, and password resets.
- **Secure Backend:** Powered by Supabase with extensive Role-Level Security (RLS) policies and Edge Functions.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, TypeScript
- **Styling:** Tailwind CSS, Framer Motion, shadcn/ui
- **Backend:** Supabase (Auth, Database, Storage, Edge Functions)
- **Emails:** Resend API
- **Payments:** Paystack / MoMo Aggregators

---

## ⚙️ Local Setup

### 1. Prerequisites
- Node.js (v18+)
- Supabase CLI (optional, for local development)

### 2. Installation
```bash
git clone https://github.com/mrcodegeorge/fuzzy-octo-carnival.git
cd fuzzy-octo-carnival
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
# Required for edge functions if deploying via CLI
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Running the App
```bash
npm run dev
```

---

## 💾 Database & Seeding

The project comes with prepared SQL migrations and a seed script.
1. **Migrations:** Located in `supabase/migrations/`. 
2. **Seeding:** To populate the shop with sample skincare products, run the SQL in `supabase/seed.sql` via the Supabase SQL Editor.

---

## 📧 Email Configuration (Auth Hook)

This project uses a custom **Auth Hook** for password resets via Resend.
1. Deploy the hook: `npx supabase functions deploy auth-hook`
2. Configure **Resend API Key** in the `store_settings` table.
3. Enable the **"Send Email Hook"** in the Supabase Auth Settings dashboard.

---

## 🗺️ Roadmap
- [x] Initial Storefront & Admin Layout
- [x] Supabase Migration & Edge Functions
- [x] Resend API Integration (Order Emails & Password Reset)
- [ ] Optimized MoMo Checkout Flow (In Progress)
- [ ] Push Notification system for order updates
- [ ] Multi-currency support (GHS / USD)

---

## 📄 License
This project is private and intended for Tillies Avenue Glow.
